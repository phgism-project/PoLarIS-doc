# 快速开始

本页用于放置 PoLarIS 的最小可运行流程。正式发布前，可以先把内部测试案例整理到这里。

## 1. 获取代码

```bash
git clone https://github.com/example/PoLarIS.git
cd PoLarIS
```

## 2. 准备环境

请在这里列出编译器、MPI、NetCDF、HDF5、Python 后处理工具等依赖。

```bash
# 示例：根据实际项目替换
module load compiler mpi netcdf
```

## 3. 编译模型

```bash
make
```

## 4. 运行测试案例

```bash
./polaris --config examples/idealized/config.yml
```

## 5. 查看输出

输出文件通常包括模型状态量、诊断量和日志文件。建议在这里放一个最小结果图，帮助新用户确认运行是否成功。
