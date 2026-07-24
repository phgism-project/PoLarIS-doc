# 输入数据

PoLarIS 的冰盖模块主要通过命令行选项或 `.options` 文件读取输入数据。实际运行时最常见的三个输入文件参数是：

| 参数 | 作用 | 示例 |
| --- | --- | --- |
| `-mesh_file` | 计算网格文件。冰盖算例通常使用 NetCDF 网格，包含水平网格和分层网格所需信息。 | `mesh.nc`, `mesh_20x20.nc` |
| `-topo_file` | 主地形和冰盖状态文件。读取几何、厚度、温度、摩擦、掩膜以及部分强迫变量。 | `testC.nc` |
| `-forcing_file` | 可选气候强迫 NetCDF 文件。用于单独提供随时间变化的气候或海洋强迫。 | `forcing.nc` |

示例配置：

```text
-partitioner user
-mesh_file mesh.nc
-topo_file testC.nc
# -forcing_file forcing.nc
```

冰盖算例建议使用 `-partitioner user`。代码中的示例说明指出，冰盖网格依赖预先保存的分区信息，使用其他分区器可能导致边界和分层网格处理错误。

## 网格文件

`mesh_file` 描述模型计算网格。对于冰盖问题，PoLarIS 通常使用分层网格：

- 水平方向是二维三角形网格；
- 垂向通过层结构扩展为三维冰体；
- 计算中可使用棱柱单元或将棱柱分解为四面体；
- `+use_prism_elem` 表示使用棱柱单元相关处理。

常用网格相关参数：

| 参数 | 说明 |
| --- | --- |
| `-mesh_file` | 网格文件路径 |
| `-grid_coord_unit` | 网格坐标单位缩放，默认示例中为 `1000` |
| `-periodicity` | 周期边界设置，ISMIP-HOM 示例使用 `3` |
| `-pre_refines` | 运行前网格加密次数 |
| `+update_bdry_type` | 根据冰盖几何和掩膜更新边界类型 |
| `+use_prism_elem` | 使用冰盖分层/棱柱网格处理 |

## 地形与初始状态

`topo_file` 是最核心的 NetCDF 输入文件。它通常包含：

| 类型 | 变量或内容 | 说明 |
| --- | --- | --- |
| 几何 | surface, bed, thickness | 表面高程、基岩高程、冰厚等 |
| 温度 | temperature 或三维温度场 | 用于初始化热状态，或在不求解温度时直接作为输入 |
| 底部摩擦 | beta, beta2 | 底部滑动或 Robin 反演使用的摩擦系数 |
| 掩膜 | grounded/floating/inactive/front masks | 用于识别接地冰、浮冰、非活动冰和冰前缘 |
| 观测量 | surface velocity, `smb_obs`, `dhdt_obs` | Robin 反演和平衡速度修正使用 |
| 强迫 | `accumulation_rate`, `thermalForcing`, `subglacialDrainage` | 可作为静态或瞬态强迫 |

底部状态由冰厚、基岩高程和浮力条件判定。当前实现中，冰厚低于阈值的顶点会被标记为非活动冰；满足浮力条件的顶点标记为浮冰；其余底部顶点作为接地滑动边界处理。

## 气候与海洋强迫

PoLarIS 支持静态二维强迫，也支持带 `time` 维度的瞬态强迫。以下变量可以是二维场，也可以是三维的时间序列：

```text
accumulation_rate(y, x)
accumulation_rate(time, y, x)

surface_temperature(y, x)
surface_temperature(time, y, x)

basal_melt_rate(y, x)
basal_melt_rate(time, y, x)

thermalForcing(y, x)
thermalForcing(time, y, x)

subglacialDrainage(y, x)
subglacialDrainage(time, y, x)
```

其中：

- `accumulation_rate` 表示表面质量平衡，单位通常为 m ice equivalent yr-1；
- `thermalForcing` 可用于参数化冰架底融或冰前缘融化；
- `basal_melt_rate` 可直接提供底融率；
- `surface_temperature` 用于温度求解或温度边界条件；
- `subglacialDrainage` 用于和热强迫一起计算部分海洋融化参数化。

## 时间轴

模型时间单位是年。`Time`、`-time_start`、`-time_end` 和 `-dt` 都以年为单位。

如果输入文件包含 NetCDF 时间轴，可以启用：

```text
+use_nc_forcing_time
```

启用后，模型会读取 `time(time)` 并在相邻时间记录之间线性插值。月尺度强迫推荐写成十进制年份：

```text
2014.000000
2014.083333
2014.166667
2014.250000
...
```

也支持常见 CF 时间单位，例如：

```text
days since 1850-01-01 00:00:00
hours since 1850-01-01 00:00:00
seconds since 1850-01-01 00:00:00
```

如果旧输入文件没有 `time` 变量，可以不启用 `+use_nc_forcing_time`，模型会使用原有的按年索引方式。

## 检查清单

准备输入数据时建议检查：

- `mesh_file`、`topo_file` 和可选 `forcing_file` 路径是否相对于运行目录正确；
- 网格坐标单位是否和 `-grid_coord_unit` 一致；
- NetCDF 变量名、维度顺序和单位是否与模型约定一致；
- 瞬态强迫的 `time` 轴是否覆盖 `-time_start` 到 `-time_end`；
- 冰厚、基岩高程和掩膜是否能正确区分接地冰、浮冰和非活动冰；
- 如果使用 `-partitioner user`，网格文件中应包含或对应已有的分区信息。
