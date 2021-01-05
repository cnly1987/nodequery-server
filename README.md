# nodequery-server

#### 介绍
nodequery-server  基于nodequery.com的开源客户端开发的服务端。

#### 软件架构
python3
django3
mysql
mongodb
celery


#### 安装教程

1.  安装python3,pip3
2.  克隆项目代码，或者下载ZIP解压
3.  安装依赖:pip -r requirement.txt
4.  安装mysql(>=5.7),mongodb(>=4.2)
5.  配置项目录下nqmonitor/setting.py 根据注释填写mysql和mongodb的信息，注意数据库名为nqmonitor
6.  安装gunicorn和supervisor,配置django 进程守护
7.  安装nginx并配置gunicorn代理

#### 具体部署

###### 以centos7为例。
###### 作为服务端，服务器建议2H4G以上。如果是你的监控的服务器比较小，可以选择1H1G的。

1.  安装lnmp，具体见：https://lnmp.org/install.html
2.  安装python3,pip3, 具体可以参考https://blog.csdn.net/qq_36357820/article/details/89631712
3.  克隆本项目或者下载ZIP解压到 你的目录，比如/home/wwwroot/
4.  


