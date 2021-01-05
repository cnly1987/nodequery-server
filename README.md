# nodequery-server

#### 介绍
nodequery-server  基于nodequery.com的开源客户端开发的服务端。

#### 软件架构
python3
django3
mysql
mongodb
celery

#### 演示
演示地址:http://www.monitorx.xyz/
![Alt text](http://www.monitorx.xyz/static/assets/images/nodequery/home1.png)
![Alt text](http://www.monitorx.xyz/static/assets/images/nodequery/home2.png)
![Alt text](http://www.monitorx.xyz/static/assets/images/nodequery/home3.png)

#### 安装流程

1.  安装python3,pip3
2.  克隆项目代码，或者下载ZIP解压
3.  安装依赖:pip -r requirement.txt
4.  安装mysql(>=5.7),mongodb(>=4.2)
5.  配置项目录下nqmonitor/setting.py 根据注释填写mysql和mongodb的信息，注意数据库名为nqmonitor
6.  安装gunicorn和supervisor,配置django 进程守护
7.  安装nginx并配置gunicorn代理

#### 具体部署

###### 以centos7为例， 作为服务端，服务器建议2H4G以上。如果是你的监控的服务器比较小，可以选择1H1G的。

1.  安装lnmp，具体见：https://lnmp.org/install.html， 本步骤只是为了安装nginx/mysql环境，可以用yum或者其他类似面板替代如(BT,AMH等)
2.  安装python3,pip3, 具体可以参考https://blog.csdn.net/qq_36357820/article/details/89631712
3.  克隆本项目或者下载ZIP解压到 你的目录，比如/home/wwwroot/
4.  在项目目录下安装依赖，执行 pip -r requirement.txt, 或者安装pipenv创建虚拟ENV
5.  在mysql和mongodb中创建数据库nqmonitor.
6.  在项目目录下nqmonitor/setting.py中 填写mysql数据库账号密码，以及mongodb账号密码，文件中有如何填写的注释。
7.  执行python manage.py makemigrations  
8.  执行python manage.py migrate    创建mysql表
9.  执行python manage.py createsuperuser 创建超级用户。
10. 安装gunicron    执行：pip install gunicron
11. 安装supervisor    执行：pip install supervisor
12. 配置supervisor 守护django 进程，  supervisor教程：http://www.awkxy.com/Linux/supervisor.html
13. 配置nginx反代，绑定域名
14. 完工


#### 备注
1.  安装脚本在/static/sh 目录下，请把域名替换成你的域名。
2.  首页代码在templates/index.html 需要修改的自行编辑
3.  修改网站名称的，请前往 templates/layout/base.html 