# 参数配置

PoLarIS 当前主要使用 PHG 风格的 `.options` 文件配置实验。参数文件由一行一个选项组成：

- `-name value` 表示带值参数；
- `+name` 表示启用布尔开关；
- `-name` 单独出现时通常表示关闭布尔开关；
- 以 `#` 开头的行为注释。

示例：

```text
-verbosity 2
-log_file log/log
-partitioner user

-mesh_file mesh.nc
-topo_file testC.nc
+update_bdry_type

-core_type fo
-utype P1
-ptype P1
-T_type P2
+use_prism_elem

+solve_temp
-solve_height
-dt 0.0833333333333333
-time_start 2014.0
-time_end 2025.0
+use_nc_forcing_time
```

运行时可以直接读取参数文件，也可以在命令行追加参数覆盖文件中的设置。具体执行方式取决于编译出的程序名和所在算例目录。

## 基础设置

| 参数 | 示例 | 说明 |
| --- | --- | --- |
| `-verbosity` | `2` | 日志输出详细程度 |
| `-log_file` | `log/log` | 日志文件路径 |
| `-mem_max` | `3000` | 每个进程可用内存上限，单位 MB |
| `-partitioner` | `user` | 分区器。冰盖算例通常使用 `user` |
| `+resume` |  | 从已有记录继续运行 |
| `+record` |  | 保存可续算数据 |
| `+record_recent` |  | 只保存最近续算记录 |

## 网格与几何

| 参数 | 示例 | 说明 |
| --- | --- | --- |
| `-mesh_file` | `mesh.nc` | 网格文件 |
| `-topo_file` | `testC.nc` | 地形、冰厚、温度、掩膜和部分强迫数据 |
| `-forcing_file` | `forcing.nc` | 可选气候强迫文件 |
| `-grid_coord_unit` | `1000` | 网格坐标单位缩放 |
| `-periodicity` | `0`, `3` | 周期边界设置 |
| `-pre_refines` | `0` | 运行前网格加密次数 |
| `+update_bdry_type` |  | 根据几何和掩膜更新边界类型 |
| `-topo_shift_x`, `-topo_shift_y` | `0` | 地形数据相对网格的水平平移 |

冰盖算例一般建议：

```text
-partitioner user
+update_bdry_type
-pre_refines 0
```

## 动力核心与有限元空间

动力核心通过 `-core_type` 设置。源码中支持的核心包括 Stokes、SIA、SSA 和 first-order，其中当前示例重点使用 first-order：

```text
-core_type fo
```

常用离散参数：

| 参数 | 示例 | 说明 |
| --- | --- | --- |
| `-core_type` | `fo` | 动力核心，`fo` 表示一阶近似 |
| `-utype` | `P1`, `P2` | 速度有限元空间 |
| `-ptype` | `P1` | 压强有限元空间 |
| `-T_type` | `P2` | 温度有限元空间 |
| `+use_prism_elem` |  | 使用棱柱/分层网格处理 |
| `+enclosed_flow` |  | 封闭流场处理 |
| `+pin_node` |  | 压强或封闭流场中固定一个节点以消除零空间 |
| `-stab_scheme` | `-1` | 压强稳定化方案 |
| `-stab_remove_static` | `-1` | 稳定化相关设置 |

ISMIP-HOM 示例使用：

```text
-core_type fo
-utype P1
-ptype P1
-T_type P2
+use_prism_elem
```

EISMINT-II 示例使用 Stokes 风格设置：

```text
-utype P2
-ptype P1
-T_type P2
+use_prism_elem
```

## 底部边界、滑动和融化

| 参数 | 示例 | 说明 |
| --- | --- | --- |
| `-sliding_law` | `1` | 底部滑动律 |
| `+use_slide` |  | 启用滑动边界处理 |
| `+use_float` |  | 启用浮冰边界处理 |
| `-sliding_bdry_scheme` | `0` | 滑动边界处理方案 |
| `-sliding_penalty` | 数值 | 滑动惩罚参数 |
| `-grounding_line_scheme` | `5` | 接地线附近浮/接地部分处理方案 |
| `-basal_melt_type` | `0` 到 `4` | 底融参数化类型 |
| `-beta_min`, `-beta_max` | `1e-5`, `1e5` | 底部摩擦系数范围 |

`basal_melt_type` 的含义：

| 值 | 含义 |
| --- | --- |
| `0` | 不使用底融 |
| `1` | 读取 `basal_melt_rate` |
| `2` | 根据冰架 draft 估计 |
| `3` | 使用 `thermalForcing` 计算冰架底融 |
| `4` | 使用 grounded calving-front Rignot melt |

## 温度、厚度和表面演化

| 参数 | 示例 | 说明 |
| --- | --- | --- |
| `+solve_temp` / `-solve_temp` |  | 是否求解温度 |
| `+solve_height` / `-solve_height` |  | 是否更新冰厚/表面 |
| `-init_temp_type` | `-1`, `1` | 初始温度设置 |
| `-temp_viscosity` | 数值 | 温度相关粘性设置 |
| `-height_scheme` | `3` | 厚度更新方案 |
| `+use_margin_migration` |  | 允许陆地边缘推进和重新激活 |
| `-active_ice_min_thickness` | km | 低于该厚度视为非活动冰 |
| `-active_ice_reactivation_thickness` | km | 非活动冰重新激活阈值 |

表面松弛相关参数：

| 参数 | 说明 |
| --- | --- |
| `+surface_relaxation` | 启用保守表面松弛模式 |
| `+surface_relaxation_grounded_only` | 只接受接地冰区域厚度变化 |
| `+surface_relaxation_fix_margin` | 固定初始边缘、冰前缘和非活动列 |
| `+surface_relaxation_disable_calving` | 松弛时禁用崩解 |
| `+surface_relaxation_disable_melt` | 松弛时忽略底融和前缘融化 |

## 时间控制和输出间隔

模型时间单位是年。

| 参数 | 示例 | 说明 |
| --- | --- | --- |
| `-time_start` | `2014.0` | 起始时间 |
| `-time_end` | `2025.0` | 结束时间 |
| `-dt` | `0.0833333333333333` | 初始时间步长 |
| `-theta` | `1.0` | 时间离散中的 theta 系数 |
| `-max_time_step` | `1` | 最大时间步数 |
| `-step_span` | `1` | 输出间隔，按时间步计 |
| `-outputTimeScheme` | `1` | 输出时间命名和调度方案 |
| `+use_nc_forcing_time` |  | 使用 NetCDF `time` 坐标进行瞬态强迫插值 |

月尺度强迫建议：

```text
-dt 0.0833333333333333
+use_nc_forcing_time
```

年度输出可配合：

```text
-outputTimeScheme 1
-step_span 1
```

## 非线性和线性求解

常用非线性参数：

| 参数 | 示例 | 说明 |
| --- | --- | --- |
| `+non_linear` |  | 启用非线性求解 |
| `+start_const_vis` |  | 第一轮使用常粘性初始化 |
| `-non_tol` | `1e-6` | 非线性迭代收敛容差 |
| `-non_sub_tol` | `1e-4` | 非线性子步线性求解容差 |
| `-max_non_step0` | `40` | 第一个时间步最大非线性迭代数 |
| `-max_non_step` | `4` | 后续时间步最大非线性迭代数 |
| `-min_non_step` | `3` | 最小非线性迭代数 |
| `-newton_start` | `15` | 从 Picard 切换到 Newton 的迭代步 |

线性求解常通过 `-fo_opts`、`-Stokes_opts`、`-proj_opts` 和 `-oem_options` 传递给 PHG/PETSc。FO 的 ASM+MUMPS 示例：

```text
-fo_opts "-solver petsc -solver_matrix_free disallow -petsc_ksp_prefix fo_"

-oem_options {
    -fo_ksp_type fgmres
    -fo_ksp_gmres_restart 100
    -fo_pc_type asm
    -fo_pc_asm_overlap 2
    -fo_pc_asm_type restrict
    -fo_sub_ksp_type preonly
    -fo_sub_pc_type lu
    -fo_sub_pc_factor_mat_solver_type mumps
    -fo_ksp_max_it 100
    -fo_ksp_rtol 1e-7
}
```

## 输出设置

| 参数 | 说明 |
| --- | --- |
| `+output_vtk` | 输出 VTK 文件，例如 `ice_*.vtk` |
| `+output_nc` | 输出模型状态 NetCDF |
| `+output_ismip_nc` | 输出 ISMIP 风格 NetCDF |
| `+output_non_iter` | 输出非线性迭代过程文件 |
| `+output_temp_init` | 输出初始温度 |
| `+output_beta` | 输出底部摩擦系数 |
| `+output_geoHeatFlux` | 输出地热通量 |
| `+output_melt` | 输出融化率 |
| `+output_parted` | 输出分区结果 |
| `+output_fv_vert` | 输出有限体积厚度更新诊断 |
| `+output_grounding_line` | 输出接地线诊断 |

输出文件通常写入运行目录下的 `output/`，日志写入 `log/`。
