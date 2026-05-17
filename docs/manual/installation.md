# 安装与编译

## 系统要求

请根据实际情况补充：

| 组件 | 建议版本 | 说明 |
| --- | --- | --- |
| 编译器 | 待补充 | Fortran / C / C++ 编译器要求 |
| MPI | 待补充 | 并行运行环境 |
| NetCDF | 待补充 | 模型输入输出 |
| HDF5 | 待补充 | 数据格式支持 |
| Python | 3.10+ | 后处理与绘图 |

## 编译步骤

```bash
make clean
make
```

## 常见编译问题

!!! warning "NetCDF 路径"
    如果编译器找不到 NetCDF，请检查 `NETCDF_ROOT`、`LD_LIBRARY_PATH` 或集群模块加载配置。
