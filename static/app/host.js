var app = {
    data:{
        id:host_id,
        host:{},
        initTimes:180,
        records:{},
        ps:[]
    },
    methods:{
        digMapObject:function(obj){
            return _.map(obj, function(item, index){
                if(typeof item === 'number'){
                    obj[index] = toDecimal(item)
                }
            })
        },
        lineChart:function(dom, data, option){
            var ctx = document.getElementById(dom).getContext('2d');
            var doption = {
                legend: {
                    position: 'bottom',
                    // display: false
                },
                hover: {
                    onHover: this.onChartHover,  // 防止鼠标移上去，数字闪烁
                },
                tooltips: {
                    callbacks: {
                        title: function() {
                                return '';
                        },
                        label: function(item, data) {
                        var datasetLabel=data.datasets[item.datasetIndex].label||'';
                        var dataPoint = item.yLabel;
                        return datasetLabel + ': '+ dataPoint + 'min';
                        }
                    }
                }
            }
            option = option || doption
            return new Chart(ctx, {
                type: 'line',
                data: data, 
                options: option
            }); 
        },
        charoption:function(data, labels, title){
            return {
                title: {
                    text: title||""
                },
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: labels
                },
                yAxis: {
                    type: 'value'
                },
                series: data,
            };
        },
        timediff:function(d1, d2){
            d2 = d2 || null
            var n1 = new Date(d1)
            var n2 = d2?new Date(d2):new Date()
            var diff = (n2-n1)/1000
            return diff
        },
        ISOdate:function(time){
            return time.split('.')[0].replace('T', ' ')
        },
        timestring : function(time) { 
            var formats = function(x) {
                return (x < 10) ? ("0" + x) : x;
            };
            var date = time?new Date(time):new Date();
            var year = date.getFullYear();
            var month = formats(date.getMonth() + 1);
            var day = formats(date.getDate());
            var hours = formats(date.getHours());
            var minite = formats(date.getMinutes());
            var seconds = formats(date.getSeconds());
            return year + '-' + month + '-' + day + ' ' + hours + ':' + minite + ':' + seconds
        },
        format_ram:function(ram){
            var d = toDecimal(intVal(ram)/(1024*1024))
            if(d > 1000){
                return toDecimal(d/1000)+'GB'
            }else{
                return toDecimal(d) +'MB'
            }
        },
        formatProcess:function(str, length){
            length = length || 15
            var list = str.split(';')
            var res = []
            _.each(list, function(item){
                var d = item.split(' ')
                var obj = {
                    user:d[0],
                    cpu:intVal(d[1]),
                    mem:intVal(d[2]),
                    name:d[3] 
                }
                res.push(obj)
            })
            var group = _.groupBy(res, 'name')
            // console.log(group)
            var result = _.map(_.keys(group), function(e) {
                return _.reduce(group[e], function(r, o) {
                  return r.mem += +o.mem, r
                }, {name: e, user:group[e][0].user, cpu:group[e][0].cpu, mem:0,  count: group[e].length})
              })
            var ps=  _.orderBy(result, [ 'cpu', 'mem'], ['desc', 'desc'])

            var ptbody =''
            _.each(ps.slice(0, length), function(item){
                var mem = toDecimal(item.mem/1024)
                ptbody += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.count}</td>
                        <td>${item.cpu}%</td>
                        <td>${ mem>1?(mem+'MB'):(toDecimal(mem*1024)+'KB' )}</td>
                        <td>${item.user}</td>
                    </tr>
                `
            })
            $("#processes_table tbody").empty().append(ptbody)
        },
        formatDisk:function(str){
            if(str){
                var d = str.replace(";", '').split(' ')
                var sd =  {
                    name:d[0],
                    total:toDecimal(intVal(d[1])/(1024*1024*1024), 2),
                    usage:toDecimal(intVal(d[2])/(1024*1024*1024), 2),
                }
                var pt = toDecimal(sd.usage/sd.total*100)
             
                var bd = `
                        <tr>
                            <td>${sd.name}</td>
                            <td>${sd.usage} GB</td>
                            <td>${sd.total} GB</td>
                            <td>
                                <div class="progress">
                                    <div class="progress-bar ${pt>80?'progress-bar-danger':''}" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: ${pt}%;">
                                        ${pt}%
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `
                $("#disk-array").empty().append(bd)
               
            } 
        },
        mgraph:function(host){
      
            var loads = host.loads?host.loads.split(' ').map(Number):[0,0,0]
            var ram_usage = toDecimal(  intVal(host.ram_usage/(1024*1024) ) )
            var ram_total = toDecimal(  intVal(host.ram_total/(1024*1024) ) )

            var disk_usage = toDecimal(  intVal(host.disk_usage/(1024*1024) ) )
            var disk_total = toDecimal(  intVal(host.disk_total/(1024*1024) ) )
          
            return `
                <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                    <div class="info-box bg-cyan " >
                            
                        <div class="content"  >
                            <div class="text">Average system load</div>
                            <div class="number" style="padding-top:20px">
                                <p>
                                    <span style="font-size:30px">${toDecimal(loads[1]*100<100?loads[1]*100:100)}%</span> <span style="font-size:14px">${host.loads}</span>
                                </p>
                            </div>
                            <div style="padding-top:20px">
                                <div class="progress" style="width:100%" data-toggle="tooltip" data-placement="top" data-original-title="loads:${host.loads}">
                                    <div class="progress-bar  ${loads[1]*100>80?'progress-bar-danger':'progress-bar-success'}   active" role="progressbar" aria-valuenow="75" aria-valuemin="0" 
                                            aria-valuemax="100" style="width: ${loads[1]*100<100?loads[1]*100:100}%"  >
                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                    <div class="info-box bg-green">
                        
                        <div class="content">
                            <div class="text">Current RAM usage</div>
                            <div class="number" style="padding-top:20px">
                                <p>
                                    <span style="font-size:30px">${ram_usage>1000?(toDecimal(ram_usage/1024)+'GB' ):(ram_usage+'MB') }</span>  
                                    <span style="font-size:14px">of ${ram_total>1000?(toDecimal(ram_total/1024)+'GB' ):(ram_total+'MB') } </span>
                                </p>
                            </div>
                            <div style="padding-top:20px">
                                <div class="progress" data-toggle="tooltip" data-placement="top" data-original-title="RAM:${app.methods.format_ram(host.ram_usage)}/${app.methods.format_ram(host.ram_total)}">
                                    <div class="progress-bar ${(host.ram_usage/host.ram_total*100)>80?'progress-bar-danger':'progress-bar-info'}  active" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" 
                                        style="width: ${host.ram_usage/host.ram_total*100}%"  >
                                        
                                    </div>
                                </div>
                            </div>
                                
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                    <div class="info-box bg-light-blue">
                        
                        <div class="content">
                            <div class="text">Overall disk usage</div>
                            <div class="number" style="padding-top:20px">
                                <p>
                                    <span style="font-size:30px">${disk_usage>1000?(toDecimal(disk_usage/1024)+'GB' ):(disk_usage+'MB') }</span> 
                                    <span style="font-size:14px">of ${disk_total>1000?(toDecimal(disk_total/1024)+'GB' ):(disk_total+'MB') } </span>
                                </p>
                            </div>
                            <div style="padding-top:20px">
                                <div class="progress" data-toggle="tooltip"  data-placement="top" data-original-title="DISK:${app.methods.format_ram(host.disk_usage)}/${app.methods.format_ram(host.disk_total)}">
                                    <div class="progress-bar  ${(host.disk_usage/host.disk_total*100)>80?'progress-bar-danger':'progress-bar-success'}  active" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" 
                                        style="width: ${host.disk_usage/host.disk_total*100}%"  >
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        psm:function(dom){
            var t = $(dom).text()
            if(t === 'More'){
                $(dom).text('Less').removeClass('btn-info').addClass('btn-danger')
                app.methods.formatProcess(app.data.host.processes_array, 30)
            }else{
                $(dom).text('More').removeClass('btn-danger').addClass('btn-info')
                app.methods.formatProcess(app.data.host.processes_array)
            }
        },
        detail:function(host){
            var uptime =  Math.ceil(intVal(host.uptime)/(60*60*24) )
            var net_usage = toDecimal((host.rx_gap+host.tx_gap)/(1024*8*2))
            var tbody = `
                <tbody>
                    <tr>
                        <td>IP Address:</td>
                        <td><a href="https://ip-api.com/#${host.ipv_4}" target="_blank">${host.ipv_4} </a></td>
                        <td>Last updated:</td>
                        <td>${app.methods.timestring(host.updated_at)}</td>
                    </tr>
                    <tr>
                        <td>System Uptime:</td>
                        <td>${uptime}</td>
                        <td>CPU Model:</td>
                        <td>${ host.cpu_name}</td>
                    </tr>
                    <tr>
                        <td>Operating System:</td>
                        <td>${ host.os_name}</td>
                        <td>CPU Speed:</td>
                        <td>${ host.cpu_cores}x${ host.cpu_freq} MHz</td>
                    </tr>
                    <tr>
                        <td>Kernel:</td>
                        <td>${ host.os_kernel}</td>
                        <td>Network Activity:</td>
                        <td> ${  net_usage>1000? toDecimal(net_usage/1024)+'MB/s':net_usage+'KB/s' } ↑↓ </td>
                    </tr>
                    <tr>
                        <td>File Handles:</td>
                        <td>${ host.file_handles} of  ${host.file_handles_limit}</td>
                        <td>Total Outgoing ↑:</td>
                        <td> ${toDecimal(host.tx/(1024*1024*1024*8))} GB</td>
                    </tr>
                    <tr>
                        <td>Processes:</td>
                        <td>${ host.processes}</td>
                        <td>Total Incoming ↓:</td>
                        <td> ${toDecimal(host.rx/(1024*1024*1024*8))} GB</td>
                    </tr>
                    <tr>
                        <td>Sessions:</td>
                        <td>${ host.sessions}</td>
                        <td>Connections:</td>
                        <td> ${host.connections}</td>
                    </tr>
                </tbody>
            `
           return tbody
        },
        net_useage_chart:function(records, xlist){
            xlist = xlist|| null
            var option = {
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: xlist?xlist:_.map(_.map(records, 'updated_at'),  function(item){
                            return app.methods.ISOdate(item).split(' ')[1]
                        })
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: 'rx[KB]',
                        type: 'line',
                        stack: '',
                        data:  _.map(records, function(item){
                            return toDecimal(item.rx_gap/(1024*8))
                        }),  
                    },
                    {
                        name: 'tx[KB]',
                        type: 'line',
                        stack: 'KB',
                        data: _.map(records, function(item){
                            return toDecimal(item.tx_gap/(1024*8))
                        }),  
                    },
              
                ]
            };
            var net_useage_chart = echarts.init(document.getElementById('net_usage_chart'));
            net_useage_chart.setOption(option);
        },
        net_late_chart:function(records, xlist){
            xlist = xlist|| null
            var option = {
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: xlist?xlist:_.map(_.map(records, 'updated_at'),  function(item){
                        return app.methods.ISOdate(item).split(' ')[1]
                    })
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: 'ping_us',
                        type: 'line',
                        stack: 's',
                        data:  _.map(_.map(records, 'ping_us'),toDecimal), 
                    },
                    {
                        name: 'ping_eu',
                        type: 'line',
                        stack: 's',
                        data: _.map(_.map(records, 'ping_eu'),toDecimal), 
                    },
                    {
                        name: 'ping_as',
                        type: 'line',
                        stack: 's',
                        data: _.map(_.map(records, 'ping_as'),toDecimal), 
                    },
              
                ]
            };
            var net_late_chart = echarts.init(document.getElementById('net_late_chart'));
            net_late_chart.setOption(option);
         
        },
        load_chart:function(records, xlist){
            xlist = xlist || null
            var option = {
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: xlist?xlist:_.map(_.map(records, 'updated_at'),  function(item){
                        return app.methods.ISOdate(item).split(' ')[1]
                    })
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: 'Load system',
                        type: 'line',
                        stack: 'KB',
                        data: _.map(records, function(item){ 
                            return item.system_load?toDecimal(item.system_load):item.loads.split(' ')[1]
                        }),  
                    },
                    {
                        name: 'load_io',
                        type: 'line',
                        stack: 'KB',
                        data: _.map(_.map(records, 'load_io'), toDecimal),  
                    },
                    {
                        name: 'load_cpu',
                        type: 'line',
                        stack: 'KB',
                        data: _.map(_.map(records, 'load_cpu'), toDecimal),  
                    }, 
                ]
            };
            var load_chart = echarts.init(document.getElementById('load_chart'));
            load_chart.setOption(option);
         
        },
        ram_chart:function(records, xlist){
            var option = {
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: xlist?xlist:_.map(_.map(records, 'updated_at'),  function(item){
                        return app.methods.ISOdate(item).split(' ')[1]
                    })
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: 'ram[MB]',
                        type: 'line',
                        stack: 'MB',
                        data: _.map(records, function(item){
                            return toDecimal(item['ram_usage']/1048576, 1)
                        }), 
                    },
                    {
                        name: 'swap[MB]',
                        type: 'line',
                        stack: 'MB',
                        data: _.map(records, function(item){
                            return toDecimal(item['swap_usage']/1048576, 1)
                        }), 
                    },
               
              
                ]
            };
            var ram_chart = echarts.init(document.getElementById('ram_chart'));
            ram_chart.setOption(option); 
        },
        disk_chart:function(records, xlist){
            var option = {
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: xlist?xlist:_.map(_.map(records, 'updated_at'),  function(item){
                        return app.methods.ISOdate(item).split(' ')[1]
                    })
                },
                yAxis: {
                    type: 'value'
                },
                series: [ 
                    {
                        name: 'disk[GB]',
                        type: 'line',
                        stack: 'GB',
                        data: _.map(records, function(item){
                            return toDecimal(item['disk_usage']/(1048576*1024), 1)
                        }), 
                    },
               
              
                ]
            };
            var disk_chart = echarts.init(document.getElementById('disk_chart'));
            disk_chart.setOption(option);
           
        },
        chart_change:function(type, chart){
            console.log(type,chart)
            switch(chart) {
                case 'net_usage':
                    if(type=='day'){
                        var d = app.data.records.days.results  
                        var sdata = _.orderBy(d, ['day', 'hour'],['asc', 'asc'])
                        console.log(sdata)
                        app.methods.net_useage_chart(sdata, _.map(sdata, 'updated_at'))
                    }else if(type=='month'){
                        var d = app.data.records.months.results  
                        var sdata = _.orderBy(d, ['month', 'day'],['asc', 'asc']) 
                        app.methods.net_useage_chart(sdata, _.map(sdata, 'updated_at'))
                    }else{
                        app.methods.net_useage_chart(app.data.records.hours.results.reverse())
                    }
                   break;
                case 'net_late':
                    if(type=='day'){
                        var d = app.data.records.days.results  
                        var sdata = _.orderBy(d, ['day', 'hour'],['asc', 'asc'])
                        console.log(sdata)
                        app.methods.net_late_chart(sdata, _.map(sdata, 'updated_at'))
                    }else if(type=='month'){
                        var d = app.data.records.months.results  
                        var sdata = _.orderBy(d, ['month', 'day'],['asc', 'asc']) 
                        app.methods.net_late_chart(sdata, _.map(sdata, 'updated_at'))
                    }else{
                        app.methods.net_late_chart(app.data.records.hours.results.reverse())
                    }
                case 'av_load':
                    if(type=='day'){
                        var d = app.data.records.days.results  
                        var sdata = _.orderBy(d, ['day', 'hour'],['asc', 'asc'])
                        console.log(sdata)
                        app.methods.load_chart(sdata, _.map(sdata, 'updated_at'))
                    }else if(type=='month'){
                        var d = app.data.records.months.results  
                        var sdata = _.orderBy(d, ['month', 'day'],['asc', 'asc']) 
                        app.methods.load_chart(sdata, _.map(sdata, 'updated_at'))
                    }else{
                        app.methods.load_chart(app.data.records.hours.results.reverse())
                    }
                case 'ram':
                    if(type=='day'){
                        var d = app.data.records.days.results  
                        var sdata = _.orderBy(d, ['day', 'hour'],['asc', 'asc'])
                        console.log(sdata)
                        app.methods.ram_chart(sdata, _.map(sdata, 'updated_at'))
                    }else if(type=='month'){
                        var d = app.data.records.months.results  
                        var sdata = _.orderBy(d, ['month', 'day'],['asc', 'asc']) 
                        app.methods.ram_chart(sdata, _.map(sdata, 'updated_at'))
                    }else{
                        app.methods.ram_chart(app.data.records.hours.results.reverse())
                    }
                case 'disk':
                    if(type=='day'){
                        var d = app.data.records.days.results  
                        var sdata = _.orderBy(d, ['day', 'hour'],['asc', 'asc'])
                        console.log(sdata)
                        app.methods.disk_chart(sdata, _.map(sdata, 'updated_at'))
                    }else if(type=='month'){
                        var d = app.data.records.months.results  
                        var sdata = _.orderBy(d, ['month', 'day'],['asc', 'asc']) 
                        app.methods.disk_chart(sdata, _.map(sdata, 'updated_at'))
                    }else{
                        app.methods.disk_chart(app.data.records.hours.results.reverse())
                    }
                default:
                   console.log('default')
           }  
        },

        update:{
            show:function(){
                $("#updateModal").modal('show')
            },
            confirm:function(){
                
            }
        },
        delete:{
            show:function(){
                $("#deleteModal").modal('show')
            },
            confirm:function(){
                Promise.all([
                    axios({ url:'/api/v1/hosts/'+app.data.host.id+'/',  method:'delete',  }),
                    axios({ url:'/api/v1/records/delete/'+app.data.host.id+'/',  method:'delete',  }),
                ]).then(function(res){
                    layer.msg('操作成功!', {icon:1})
                    $("#deleteModal").modal('hide')
                    location.href='/hosts/lists/'
                }).then(function(res){
                    layer.msg('操作失败!', {icon:2})
                    $("#deleteModal").modal('hide') 
                })
            }
        }
        
    },
    action:function(){
        $('#myTab a').click(function(e) {
            e.preventDefault();
            $(this).tab('show');
        });
    
        // store the currently selected tab in the hash value
        $("ul.nav-tabs > li > a").on("shown.bs.tab", function(e) {
            var id = $(e.target).attr("href").substr(1);
            window.location.hash = id; 
            // window.echarts.getInstanceById(cid).resize();
        });
    
        // on load of the page: switch to the currently selected tab
        var hash = window.location.hash;
        $('#myTab a[href="' + hash + '"]').tab('show');
    }, 
    mounted:function(){
        loading.set()
        axios.get('/api/v1/records/'+app.data.id+'/').then(function(res){ 
            var records = res.data.records
            app.data.records = records
            var host = res.data.host 
            app.data.host = host

            $("#mtable").empty().append(app.methods.detail(host))
            $("#mgraph").empty().append(app.methods.mgraph(host))
            app.data.ps = app.methods.formatProcess(host.processes_array)
           
            app.methods.formatDisk(host.disk_array)
            $('.progress[data-toggle="tooltip"]').tooltip({
                animated: 'fade',
                placement: 'top'
            });
            var times = Math.floor(180-app.methods.timediff(host.updated_at, new Date()) )
            app.data.initTimes = times
            var lastUpdate = toDecimal(app.methods.timediff(app.data.host.updated_at),1)
            var is_down = (lastUpdate>600)?true:false
            if(Object.keys(app.data.records).length === 0 && app.data.records.constructor === Object){
                layer.msg('暂无数据!', {icon:2})
            }  
            if(is_down){
                layer.alert('your server not response!')
                $("#last_time").parents('span').html('<span class="badge bg-pink">Your Server is Down</span>')
            }else{
                app.methods.net_useage_chart(app.data.records.hours.results.reverse())
                app.methods.net_late_chart(app.data.records.hours.results.reverse())
                app.methods.load_chart(app.data.records.hours.results.reverse())
                app.methods.ram_chart(app.data.records.hours.results.reverse())
                app.methods.disk_chart(app.data.records.hours.results.reverse())
                setInterval(function(){
                    app.data.initTimes -= 1 
                    $("#last_time").text(app.data.initTimes)
                    if(app.data.initTimes <= 0){
                        $.notify({  message: 'updated!'  }, {
                            type:'bg-purple',
                            placement: {
                                from: 'bootom',
                                align: 'right'
                            }
                        })
                        app.data.initTimes = 180
                    }
                }, 1000)
            } 
            loading.close() 
             
        }).catch(function(e){
            loading.close()
            layer.msg('加载失败!', {icon:2})
        })
         
         
             
             
         

        
    },
    init:function(){
        this.mounted()
        this.action() 
            
    }
}