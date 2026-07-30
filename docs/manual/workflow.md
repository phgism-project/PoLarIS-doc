# 模拟案例

本页根据 `install_and_example.tex` 中“数值模拟案例”一节整理。PoLarIS 的基本使用思路是：编译得到 `ins-flow` 后，准备网格文件、输入数据文件和模式参数文件，然后在算例目录中运行模拟。

## 模拟框架

PoLarIS 尽量把一次数值模拟拆成几个清晰步骤：

1. 准备网格文件；
2. 准备包含地形和气候强迫等信息的 NetCDF 输入文件；
3. 修改 `.options` 参数配置文件；
4. 创建输出、日志和错误信息目录；
5. 并行运行 `ins-flow`；
6. 使用 ParaView、`ncdump`、`ncview` 等工具检查结果。

对于新用户来说，可以先从一个理想化的小算例开始，确认编译环境、输入文件和参数文件都能正常工作，再逐步切换到真实冰川或冰盖实验。

## 网格文件

PoLarIS 基于有限元方法，支持结构网格和非结构网格。结构网格可以理解为规则、均匀的网格，生成和后处理都比较方便；非结构网格可以在重点区域灵活加密，更适合复杂边界或局地区域高分辨率模拟。

| 网格类型 | 优点 | 局限 |
| --- | --- | --- |
| 结构网格 | 数据处理方便，网格简单，容易生成 | 难以对重点区域做局部加密 |
| 非结构网格 | 可根据研究需求灵活加密或粗化不同区域 | 前后处理更复杂，网格质量会影响收敛 |

一般来说，全南极、全格陵兰、长时间古气候模拟等大范围实验可优先考虑结构网格；特定流域、冰川或高精度冰海耦合问题更适合非结构网格。

## 输入数据文件

PoLarIS 的输入数据通常放在 NetCDF 文件中，常见变量包括地形、冰厚、温度、积累率、底部摩擦和观测流速等。变量名称需要和模型读取名称一致，否则程序无法识别。

| 变量名 | 含义 | 单位 | 备注 |
| --- | --- | --- | --- |
| `bed` | 底床高程 | m |  |
| `thickness` | 冰厚度 | m |  |
| `surface` | 表面高程 | m |  |
| `temp` | 表面温度 | K |  |
| `basalHeat` | 地热通量 | mW m^-2 |  |
| `beta2` | 底部摩擦系数 | Pa s m^-1 |  |
| `accu` | 表面积累率 | m yr^-1 | 负值表示消融 |
| `ux` | 表面流速 x 分量 | m yr^-1 | 反演时使用 |
| `uy` | 表面流速 y 分量 | m yr^-1 | 反演时使用 |

可以用 `ncdump -h` 检查 NetCDF 文件头信息，也可以用 `ncview` 快速查看变量空间分布：

```bash
ncdump -h data.nc
ncview data.nc
```

## 参数配置文件

PoLarIS 使用后缀为 `.options` 的文本文件控制模拟设置。这样可以在不重新编译代码的情况下切换网格、输入数据、动力近似、滑动定律、温度求解和时间步长等参数。

| 参数名 | 含义 | 示例或选项 | 备注 |
| --- | --- | --- | --- |
| `-mesh_file` | 网格文件 | `mesh.nc` | 指向三维网格文件 |
| `-topo_file` | 输入数据文件 | `data.nc`、`testA.nc`、`testC.nc` | 包含地形、冰厚和强迫数据 |
| `-core_type` | 动力框架 | `stokes`、`fo`、`sia` | 常用 `fo` |
| `+use_slide` / `-use_slide` | 是否允许底部滑动 | 开启 / 关闭 | 具体写法按算例参数文件保持一致 |
| `-sliding_law` | 滑动定律 | `1`、`2` | `1` 为线性，`2` 为非线性 |
| `+solve_temp` / `-solve_temp` | 是否求解温度 | 开启 / 关闭 | 理想化算例可关闭温度求解 |
| `+solve_height` / `-solve_height` | 是否更新冰面高度 | 开启 / 关闭 | 稳态或单步测试可关闭 |
| `-dt` | 时间步长 | `1` | 单位通常为年 |
| `-time_end` | 模拟结束时间 | `1` | 应大于或等于时间步长 |

## 一块悬停在斜坡上的冰

第一个示例是一个理想化冰块：冰块厚度为 100 m，长度和宽度均为 5000 m，底部斜坡坡度为 0.1，并假设流动参数 `A = 1e-16`。这个算例适合用来检查网格生成、输入数据准备和模式运行流程。

### 生成二维结构网格

在 `ism-mesh/scripts` 目录中编译 `struct2d.c`：

```bash
gcc -o struct2d struct2d.c
```

`struct2d` 接受 6 个参数：

```bash
./struct2d Lx Ly x0 y0 nx ny
```

各参数含义为：

| 参数 | 含义 |
| --- | --- |
| `Lx` | 长方形在 x 方向上的长度 |
| `Ly` | 长方形在 y 方向上的长度 |
| `x0` | 区域左下角 x 坐标 |
| `y0` | 区域左下角 y 坐标 |
| `nx` | x 方向格点数 |
| `ny` | y 方向格点数 |

本例将 `Lx` 和 `Ly` 设为 5000 m，`x0` 和 `y0` 设为 0，`nx` 和 `ny` 设为 50：

```bash
./struct2d 5000 5000 0 0 50 50
```

运行后会生成 `box.node` 和 `box.elem`。

### 使用 Triangle 处理二维网格

下载并编译 `triangle`：

```bash
wget http://www.netlib.org/voronoi/triangle.zip
mkdir build
cd build
unzip ../triangle.zip
make
```

将生成的 `triangle` 可执行文件放到与 `box.node`、`box.elem` 相同的目录中，然后运行：

```bash
./triangle -rne box
```

运行后会得到 `box.1.node`、`box.1.elem`、`box.1.neigh` 和 `box.1.edge` 等二维网格文件。可以用 `showme` 查看二维网格：

```bash
./build/showme box.1
```

### 扩展为三维网格

接下来用 `triangle2prism.c` 将二维网格沿垂向扩展为三维棱柱网格：

```bash
gcc -o triangle2prism triangle2prism.c -lnetcdf
```

如果提示找不到 `netcdf-utils.h`，需要添加头文件路径，例如：

```bash
gcc -o triangle2prism triangle2prism.c -lnetcdf \
  -I/home/link/model/summerSchool2024/polaris/include/phg
```

随后运行：

```bash
./triangle2prism box.1 ../layers/layers5.N.dat
```

这里的 `layers5.N.dat` 定义了垂向归一化坐标，例如：

```text
5
0.000000e+00
7.818930e-02
1.875000e-01
3.469388e-01
5.925926e-01
1.000000e+00
```

生成的 `mesh.nc` 就是 PoLarIS 需要读取的三维网格文件。

### 生成输入数据

进入 `simpleGeo` 目录，使用示例脚本生成理想化地形和冰厚数据：

```bash
python3 build_simple_geometry.py -o data.nc
```

如果缺少 `netCDF4` Python 包，可以安装：

```bash
pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple netCDF4
```

不指定 `-o` 时，脚本默认生成 `out.nc`。生成后建议检查文件：

```bash
ncdump -h data.nc
ncview data.nc
```

### 准备算例目录

把编译好的 PoLarIS 可执行文件、网格文件和输入数据文件放到 `simpleGeo` 目录：

```bash
cp PATH/TO/ins-flow PATH/TO/simpleGeo
cp PATH/TO/mesh.nc PATH/TO/simpleGeo
cp PATH/TO/data.nc PATH/TO/simpleGeo
```

`simpleGeo` 目录中通常还包含 `ins-flow.options`、`T.asm.options`、`fo.asm.options` 和 `stokes.asm.options`。其中 `ins-flow.options` 是主要配置文件，其他 `asm.options` 文件主要与求解器设置有关，一般不需要频繁修改。

本例需要重点检查或修改以下选项：

| 参数 | 说明 |
| --- | --- |
| `-mesh_file mesh.nc` | 指定网格文件 |
| `-topo_file data.nc` | 指定输入数据文件 |
| `-constant_A 1e-16` | 不求解温度时，使用固定流动参数 |
| `-solve_temp` | 关闭温度求解 |
| `-use_slide` | 关闭底部滑动 |
| `-solve_height` | 关闭冰面高度更新 |
| `-max_time_step 1` | 最大时间步数设为 1 |
| `-dt 1` | 时间步长设为 1 年 |
| `-time_end 1` | 模拟结束时间设为 1 年 |

运行前创建输出、日志和错误信息目录：

```bash
mkdir output
mkdir log
mkdir error
```

然后并行运行：

```bash
mpirun -n 4 ./ins-flow
```

运行完成后，可以在 `output` 目录中查看生成的 VTK 文件：

```bash
paraview output/ice_00001.vtk
```

## ISMIP-HOM Benchmark 示例

LaTeX 文档中还给出了一个 ISMIP-HOM Benchmark 示例，用于进一步检查 PoLarIS 在标准测试中的运行情况。

### 生成 ISMIP-HOM 网格

进入 ISMIP-HOM 网格目录并运行批处理脚本：

```bash
cd Summer/ism-mesh/ISMIP-HOM
. batch.sh
```

该步骤会生成 `mesh.nc`、`testA.nc` 和 `testC.nc`。

### 准备运行目录

进入 PoLarIS 的 ISMIP-HOM 算例目录：

```bash
cd Summer/phgism/ice-sheet/ISMIP-HOM
```

创建输出目录：

```bash
mkdir -p output log err
```

复制网格和数据文件：

```bash
cp Summer/ism-mesh/ISMIP-HOM/*.nc .
```

### 运行测试 A

修改 `ins-flow.options`，使用：

```text
-topo_file testA.nc
```

然后运行：

```bash
mpirun -np 4 ./ins-flow \
  -options_file stokes.asm.options -max_non_step0 2
```

### 运行测试 C

修改 `ins-flow.options`，使用：

```text
-topo_file testC.nc
```

然后运行：

```bash
mpirun -np 4 ./ins-flow \
  -options_file stokes.asm.options -use_slide -max_non_step0 2
```

### 查看结果

测试完成后，用 ParaView 打开输出文件：

```bash
paraview output/ice_00001.vtk
```

如果能正常看到速度、温度或其他诊断变量，说明网格、输入数据、参数文件和并行运行流程已经基本打通。
