# 参数配置

本页用于记录 PoLarIS 配置文件结构和关键参数。

## 配置文件示例

```yaml
experiment:
  name: idealized_test
  start_year: 0
  end_year: 100

grid:
  resolution: 10000

physics:
  stress_balance: ssa
  basal_friction: coulomb
```

## 参数说明

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `experiment.name` | string | 无 | 实验名称 |
| `grid.resolution` | number | 待补充 | 水平分辨率 |
| `physics.stress_balance` | string | 待补充 | 动力学近似 |
