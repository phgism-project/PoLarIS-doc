# 安装与编译

## 系统要求
PoLarIS在Linux环境中运行。对于比较小的模拟区域或者计算量较小的案例（如单条冰川），可以在本地笔记本电脑或
者台式机上面安装运行。对于较大的模拟区域和案例（如全南极和格陵兰冰盖），则需要在服务器上运行。对于本机计算平台的
设置，我们推荐使用Ubuntu Linux系统。以下是我们在Ubuntu
22.04.1系统中的安装和运行示例，电脑CPU架构是x86_64.
请根据实际情况补充：

## 程序编译

### 并行软件安装

PoLarIS可以进行并行化计算，我们需要首先安装能够支持并行计算的软件包。
当然，如果计算量非常小，也可以选择不使用并行，仅仅用串行计算，即仅仅用1个核去计
算。在Ubuntu中，有两个常用的并行软件，mpich和openmpi，这两个软件都支持MPI并行
计算。用任何一个都可以，但需要保证和其他安装包没有冲突。比如，安装Paraview的时
候，Ubuntu会自动安装openmpi，但假如我们一开始是用mpich来安装POLARIS的，那么可
能就会有一些冲突，导致运行POLARIS的时候，并行模式工作不正常。因此，我们选择安
装openmpi：

```bash
$ sudo apt install libopenmpi-dev
```

apt是Ubuntu系统中的一个能自动安装软件的包管理器，会自动处理好一些相关的依赖关系。
安装好之后可以写一个最简单的程序来看看是否成功，比如我们可以编写一个`mpi_hello_word.c`文件

```bash
/* The Parallel Hello World Program */
#include <stdio.h> 
#include <mpi.h> 
            
int main(int argc, char **argv) {
int node; 
MPI_Init(&argc, &argv); 
MPI_Comm_rank(MPI_COMM_WORLD, &node); 
printf("Hello, world from node %d\n", node); 
MPI_Finalize(); 
return 0;
}
```

用并行版本的C编译器mpicc去编译这个程序，

```bash
$ mpicc -o mpi_hello_world mpi_hello_world.c
```

得到一个可执行文件`mpi_hello_world`，随后就可以去运行这个可执行文件：

```bash
$ mpirun -np 4 ./mpi_hello_world
```

-np表示我们想用几个核去计算，这里我们用了4个核。`./`这个符号意思是当前目录。如果一切正常，就会看到这个结果

```bash
Hello World from Node 0
Hello World from Node 1
Hello World from Node 2
Hello World from Node 3
```

这就意味着每个核都运行了程序，并输出了结果，说明并行没有问题。

### 数值计算库安装

很多人喜欢用MATLAB的原因是里面已经集成了几乎所有现成的、计算模拟需要用到的函数和各种库，
相当于哆唻A梦的口袋，需要时直接拿来用就行，或者像是一把超级瑞士军刀，所有常用的工具都折叠在一起，非
常方便。但是对于一般的计算软件，尤其是自己开发的开源软件，是没有像MATLAB这样商业软件的待遇的。比如
Python，刚开始Python并不是为了计算，后来有人开发了python版的数组运算库NumPy、面向科学计算的
SciPy、为了画图的Matplotlib，适应大型矩阵处理的Xarray等等，才有了现在python用来作科学计算非常红火
的局面。像C语言也是，为了解决C语言求解大型方程组、满足大规模计算的需求，有人就开发了配套的“工具箱”，
如果需要用到，就找到相应的工具包搭上就行。目前，比较常用的有两个，一个是美国能源部Sandia国家实验室
开发的Trillinos，另一个是美国能源部阿贡实验室开发的PETSc。为啥同一个部门要做两个？也许是因
为经费实在太多。

PoLarIS用到的是PETSc。所以下一步我们要安装PETSc。cmake是Linux系统里用来编译安装软件的一个工具，在安装PETSc之前请先安装cmake：

```bash
$ sudo apt install cmake
```

请先下载最新版本的petsc源代码petsc-xxxx.tar.gz，然后按以下步骤安装：

```bash
$ tar xzf petsc-xxxx.tar.gz
$ cd petsc-xxxx
$ export PETSC_DIR=$PWD
$ ./configure --download-mumps --download-superlu_dist
--download-parmetis --download-metis
--download-fblaslapack --download-scalapack
```

`export PETSC_DIR=$PWD`这一步的意思是要把PETSc的安装路径放到一个叫做PETSC_DIR的环境变量里面，这样
后面安装PoLarIS的时候，会自动去PETSC_DIR这个地方找到PETSc。随后，按照提示，执行命令

```bash
$ make PETSC_DIR=XXXX PETSC_ARCH=XXXX all
```

PETSc比较大，安装会慢一些，一般需要半小时左右。`make`一下对PETSc进行编译，如果最后成功，会提示运
行`make check`检查：

```bash
$ make PETSC_DIR=XXXX PETSC_ARCH=XXXX check
```

如果检查通过，运行成功，会输出下列结果：

```bash
$ Completed PETSc check examples
```

### NetCDF环境的安装

NetCDF是一种文件格式的标准。利用NetCDF可以对网络数据进行高效地存储、管理、获取和分发等操作。目前广泛应用于大
气科学、水文、海洋学、环境模拟、地球物理等诸多领域。在PoLarIS里面，输入文件是NetCDF格式，输出文件目前暂且只支持VTK格式。
在Ubuntu上面安装NetCDF环境非常简单，运行以下三个命令：

```bash
$ sudo apt install libnetcdf-dev
$ sudo apt install libhdf5-dev
$ sudo apt install libpnetcdf-dev
```

随后，我们检查 hdf5 库安装目录

```bash
$ dpkg -L libhdf5-dev | grep libhdf5.a
```

输出如

```bash
$ /usr/lib/x86_64-linux-gnu/hdf5/serial/libhdf5.a
```

记住此目录`/usr/lib/x86_64-linux-gnu/hdf5/serial/`

### 有限元平台PHG的安装

PHG全称是Parallel Hierarchical
Grid，是用来做有限元模拟的计算平台，由中国科学院科学与工程计算国家重点实
验室开发。PoLarIS就是基于PHG开发的。因此，我们这一步要进行PHG的安装：

```bash
$ cd PoLarIS文件夹
$ ./configure --disable-shared --disable-superlu
--with-hdf5-libdir=/usr/lib/aarch64-linux-gnu/hdf5/serial
```

注意使用上述HDF5目录。输出中必须要有关于netcdf、PETSc和MUMPs的成功信息:

```bash
checking whether we have NETCDF ... yes
configure: *** NETCDF enabled
checking whether we have PNETCDF ... yes
configure: *** PNETCDF enabled
configure: *** PETSc solver enabled
checking whether we have MUMPS ... yes
configure: *** MUMPS solver enabled
```

然后执行

```bash
$ make clean
$ make
```
`make clean`是为了确保不受之前编译文件的影响。成功的输出如下：

```bash
/usr/bin/ranlib libphg.a
make[1]: Leaving directory ’xxxx/polaris/src’ 
```

这样，我们就成功安装好了PHG，得到了包含PHG的静态库文件，`libphg.a`。这个静态库里面包
含了各种支持有限元模拟的函数。

## 库版本说明
| 组件 | 建议版本 | 说明 |
| --- | --- | --- |
| 编译器 | 待补充 | Fortran / C / C++ 编译器要求 |
| MPI | 待补充 | 并行运行环境 |
| NetCDF | 待补充 | 模型输入输出 |
| HDF5 | 待补充 | 数据格式支持 |
| Python | 3.10+ | 后处理与绘图 |



## 常见编译问题

!!! warning "NetCDF 路径"
    如果编译器找不到 NetCDF，请检查 `NETCDF_ROOT`、`LD_LIBRARY_PATH` 或集群模块加载配置。
