# 网格生成

PoLarIS 基于有限元方法，支持结构网格和非结构网格。结构网格可以理解为规则、均匀的网格，生成和后处理都比较方便；非结构网格可以在重点区域灵活加密，更适合复杂边界或局地区域高分辨率模拟。

| 网格类型 | 优点 | 局限 |
| --- | --- | --- |
| 结构网格 | 数据处理方便，网格简单，容易生成 | 难以对重点区域做局部加密 |
| 非结构网格 | 可根据研究需求灵活加密或粗化不同区域 | 前后处理更复杂，网格质量会影响收敛 |

一般来说，全南极、全格陵兰、长时间古气候模拟等大范围实验可优先考虑结构网格；特定流域、冰川或高精度冰海耦合问题更适合非结构网格。
对于简便模拟，结构网格已足够，PoLarIS会自动识别冰和非冰区域，跳过非冰区域进行模拟。
更为复杂的非结构网格生成待后续补充，如需要请与我们联系。

<p align="center">
  <img src="../../assets/images/mesh-glacier-schematic.png" width="85%" alt="结构网格冰川模拟示意图"><br><br>
  <!--<b>图2.1：</b>Taylor-Hood元。-->
</p>

## 生成二维结构网格

以理想化斜坡冰块算例为例，先在 `ism-mesh/scripts` 目录中编译 `struct2d.c`：

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

例如，将 `Lx` 和 `Ly` 设为 5000 m，`x0` 和 `y0` 设为 0，`nx` 和 `ny` 设为 50：

```bash
./struct2d 5000 5000 0 0 50 50
```

运行后会生成 `box.node` 和 `box.elem`。

## 使用 Triangle 处理二维网格

下载并编译 `triangle`：

```bash
wget http://www.netlib.org/voronoi/triangle.zip
mkdir build
cd build
unzip ../triangle.zip
make
```

如果编译时提示 `showme.c:104:10: fatal error: X11/Xlib.h: No such file or directory`，可先安装 X11 开发库：

```bash
sudo apt install libx11-dev
```

将生成的 `triangle` 可执行文件放到与 `box.node`、`box.elem` 相同的目录中，然后运行：

```bash
./triangle -rne box
```

运行后会得到 `box.1.node`、`box.1.elem`、`box.1.neigh` 和 `box.1.edge` 等二维网格文件。可以用 `showme` 查看二维网格：

```bash
./build/showme box.1
```

## 扩展为三维网格

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

<!-- ## ISMIP-HOM 网格 {#ismip-hom-grid}

//ISMIP-HOM Benchmark 算例的网格可以通过已有脚本生成。进入 ISMIP-HOM 网格目录并运行批处理脚本：

//```bash
//cd Summer/ism-mesh/ISMIP-HOM
//. batch.sh
//```

//该步骤会生成 `mesh.nc`、`testA.nc` 和 `testC.nc`。其中 `mesh.nc` 是网格文件，`testA.nc` 和 `testC.nc` 是后续模拟中使用的测试地形与数据文件。
-->
