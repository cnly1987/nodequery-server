var pagination = function(pageNo, pageSize, array) {
    var offset = (pageNo - 1) * pageSize;
    return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
}

// var slider_load = document.getElementById('nouislider_load');
// var slider_ram = document.getElementById('nouislider_ram');
// var slider_disk = document.getElementById('nouislider_disk');
// var soption = {
//     start: [80],
//     connect: 'lower',
//     step: 1,
//     range: {
//         'min': [0],
//         'max': [100]
//     }
// }
// noUiSlider.create(slider_load, soption);
// noUiSlider.create(slider_ram, soption);
// noUiSlider.create(slider_disk, soption);

// function getNoUISliderValue(slider, percentage) {
//     slider.noUiSlider.on('update', function () {
//         var val = slider.noUiSlider.get();
//         if (percentage) {
//             val = parseInt(val);
//             val += '%';
//         }
//         $(slider).parents('td').closest('input.nouislider-value').text(val);
//     });
// }
var app = {
    data:{
        pageLength:6,
        currenPage:1,
        total:0,
        hosts:[],
        chosts:[]
    },
    methods:{
        timediff:function(d1, d2){
            d2 = d2 || null
            var n1 = new Date(d1)
            var n2 = d2?new Date(d2):new Date()
            var diff = (n2-n1)/1000
            return diff
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
        format_disk:function(ram){
            var d = toDecimal(intVal(ram)/(1024*1024*1024))
            if(d > 1000){
                return toDecimal(d/1000)+'TB'
            }else{
                return toDecimal(d) +'GB'
            }
        },
        install:function(code){
            $("#scode").text(code)
            $("#okModal").modal('show')
        },
        add:function(){
            $('#addModal').modal('show')
        },
        renderDom:function(data){ 
            var update_at = app.methods.timestring(data.updated_at)
            if(data.cpu_name === null){
                return `
                    <div class="col-lg-4" style="padding-bottom:20px">
                        <div class="card">
                            <div class="header">
                                <div>
                                    ${data.name}
                                    <div class="pull-right">
                                        <small><span class="badge  ">not  Availability</span> <br><span class="">${update_at}</span></small>  
                                    </div>
                                </div> 
                                
                            </div>
                            <div class="body" style="height:240px">
                                        
                                <div class="col-md-12"> 
                                    未获取数据，请稍等. <br /> 
                                </div>
                                <div class="col-md-12" style="padding-top:40px">
                                    <button class="btn bg-indigo waves-effect" onclick="app.methods.install('${data.code}')">查看安装脚本</button>
                                </div>
                                
                            </div> 
                        </div>
                    </div>
                `
            }else{
                var loads = data.loads?data.loads.split(' ').map(Number):[0,0,0]
                var net_usage = toDecimal((data.rx_gap+data.tx_gap)/(1024*8*2))
                var lastUpdate = toDecimal(app.methods.timediff(data.updated_at),1)
                var is_down = (lastUpdate>600)?true:false
                return ` 
                    <div class="col-lg-4" style="padding-bottom:20px">
                        <div class="card">
                        <div class="header">
                            
                            <div>
                                <a href="/hosts/detail/${data.id}/">${data.name}</a>
                                <div class="pull-right">
                                    <small>
                                        <span style="width:100px" class="badge ${is_down?'bg-pink':'bg-cyan'} pull-right">${is_down?("Down"):"Online"} </span> <br>
                                        <span>${lastUpdate>600?("最后更新时间:"+data.updated_at):(lastUpdate+"seconds ago")} </span>
                                    </small>  
                                </div>
                            </div> 
                            
                        </div>
                        <div class="body" style="height:240px">
                                <div class="row">
                                    <div class="col-xs-2">CPU：</div>
                                    <div class="col-xs-10"><small><span class="text-primary">${data.cpu_name}</span> </small> </div> 
                                    
                                </div>
                                
                                <div class="row">
                                    <div class="col-xs-2">OS:</div>
                                    <div class="col-xs-10"><small><span class="text-primary">${data.os_name} </span></small> </div>
                                </div>
                                <div class="row">
                                    <div class="col-xs-2">IP/RX: </div>
                                    <div class="col-xs-10">
                                        <div class="row">
                                            <div class="col-xs-6"><small><span class="text-info">${data.ipv_4}</span>  </small></div>
                                            <td> ${  net_usage>1000? toDecimal(net_usage/1024)+'MB/s':net_usage+'KB/s' } ↑↓</td>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row" style="padding-top:10px">
                                    <div class="col-md-12">
                                        <table style="width:100%">
                                            <tbody>
                                                <tr>
                                                    <td>Load:</td>
                                                    <td colspan="">
                                                        <div class="progress" data-toggle="tooltip" data-placement="top" data-original-title="loads:${data.loads}">
                                                            <div class="progress-bar  ${loads[0]*100>80?'progress-bar-danger':'progress-bar-success'}   active" role="progressbar" aria-valuenow="75" aria-valuemin="0" 
                                                                    aria-valuemax="100" style="width: ${loads[0]*100<100?loads[0]*100:100}%"  >
                                                
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>RAM:</td>
                                                    <td colspan="">
                                                        <div class="progress" data-toggle="tooltip" data-placement="top" data-original-title="RAM:${app.methods.format_ram(data.ram_usage)}/${app.methods.format_ram(data.ram_total)}">
                                                            <div class="progress-bar ${(data.ram_usage/data.ram_total*100)>80?'progress-bar-danger':'progress-bar-info'}  active" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" 
                                                                style="width: ${data.ram_usage/data.ram_total*100}%"  >
                                                                
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>DISK:</td>
                                                    <td style="vertical-align:top;width:80%">
                                                    <div class="progress" data-toggle="tooltip"  data-placement="top" data-original-title="DISK:${app.methods.format_ram(data.disk_usage)}/${app.methods.format_ram(data.disk_total)}">
                                                        <div class="progress-bar  ${(data.disk_usage/data.disk_total*100)>80?'progress-bar-danger':'progress-bar-success'}  active" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" 
                                                            style="width: ${data.disk_usage/data.disk_total*100}%"  >
                                                            
                                                        </div>
                                                    </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                          
                                        </table>
                                    </div>
                                    
                                </div>
                                
                        </div>
                        
                        </div>
                    </div>
                `
            }
                
        },
        renderCard:function(data){
            $("#host_total").text(app.data.hosts.length)
            var html = '<div  style="min-height:60vh">'
            _.each(data, function(item){
                html += app.methods.renderDom(item)
            })
            html += '</div>'
            html +=`
                <div class="row">
                    <div class="col-md-12">
                        <nav>
                            <ul class="pager">
                                <li><button style="width:120px"  onclick="app.methods.pagenation.pre()"  ${app.data.currenPage===1?'disabled':''}  class="waves-effect">Previous</button></li>
                                <li><button style="width:120px" onclick="app.methods.pagenation.next()" ${app.data.currenPage===app.data.total?'disabled':''}    class="waves-effect">Next</button></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            ` 
            $("#mainlist").html(html)
            $('.progress[data-toggle="tooltip"]').tooltip({
                animated: 'fade',
                placement: 'bottom'
            });
        },
        renderList:function(data){
            $("#host_total").text(data.length)
            var tbody = ""
            _.each(app.data.hosts, function(item){
                var net_usage = toDecimal((item.rx_gap+item.tx_gap)/(1024*8*2))
                var lastUpdate = toDecimal(app.methods.timediff(item.updated_at),1)
                console.log(lastUpdate)
                if(!item.ipv_4){
                    tbody += `
                        <tr>
                            <td>${item.name}</td>
                            <td></td><td></td><td></td><td></td><td></td>
                            <td><span class="down">  </span></td>
                        </tr>
                    `
                }else{
                    tbody += `
                        <tr>
                            <td><a href="/hosts/detail/${item.id}/">${item.name}</a></td>
                            <td>${item.ipv_4}</td>
                            <td>${item.cpu_name}</td>
                            <td>
                                <span class="badge bg-pink" style="width:80px">${app.methods.format_ram(item.ram_usage)}</span><span class="badge bg-cyan" style="width:80px">${app.methods.format_ram(item.ram_total)}</span>
                            </td>
                            <td>
                                <span class="badge bg-pink" style="width:80px">${app.methods.format_disk(item.disk_usage)}</span><span class="badge bg-green" style="width:80px">${app.methods.format_disk(item.disk_total)}</span>
                            </td>
                            <td>${  net_usage>1000? toDecimal(net_usage/1024)+'MB/s':net_usage+'KB/s' } ↑↓</td>
                            <td><span class=" ${lastUpdate>600?'down':'online'} ">  </span></td>
                        </tr>
                    `
                }
            })
            var html = `
                <div class="col-md-12">
                    <div class="card"> 
                        <div class="body">
                            <div class="table-responsive">
                                <table class="table" id="list-table">
                                    <thead>
                                        <tr>
                                            <th>服务器</th>
                                            <th>IP地址</th>
                                            <th>CPU</th>
                                            <th>内存</th>
                                            <th>硬盘</th>
                                            <th>速率</th>
                                            <th>状态</th>
                                        </tr>
                                    </thead>
                                    <tbody> 
                                        ${tbody}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div> 
            ` 
            $("#mainlist").html(html)
            $("#list-table").DataTable();
            $('.progress[data-toggle="tooltip"]').tooltip({
                animated: 'fade',
                placement: 'bottom'
            });
        },
        pagenation:{
            pre:function(){
                if(app.data.currenPage >1){ 
                    app.data.currenPage -= 1
                    app.data.chosts = pagination(app.data.currenPage,app.data.pageLength, app.data.hosts)
                    app.methods.renderCard(app.data.chosts) 
                }else{
                    layer.msg('已经是第一页了!', {icon:2})
                }
            },
            next:function(){ 
                if(app.data.currenPage === app.data.total){
                    layer.msg('已经是最后一页了!', {icon:2})
                }else{
                    app.data.currenPage += 1
                    app.data.chosts = pagination(app.data.currenPage,app.data.pageLength, app.data.hosts)
                    app.methods.renderCard(app.data.chosts) 
                }
            }
        },
    },
    action:function(){
        $(".type-select-radio").click(function(){
            var v = $(this).attr('data-v')
            if(v==='card'){
                app.methods.renderCard(app.data.chosts)
            }else{
                app.methods.renderList(app.data.hosts)
            }
            console.log(v)
        })

        $("#add-form").submit(function(e){
            layer.load()
            var sdata = objectifyForm($(this).serializeArray())
            sdata.code = uuidv4().replaceAll('-', '')
            console.log(sdata)
            e.preventDefault() 
            axios({
                url:'/api/v1/hosts/',
                method:'post',
                data: sdata
            }).then(function(res){
                layer.closeAll('loading')
                console.log(res)
                $("#scode").text(res.data.code)
                $("#addModal").modal('hide')
                $("#okModal").modal('show')
                app.mounted()

            }).catch(function(e){
                layer.closeAll('loading')
                console.log(e.response)
            })
        })
    }, 
    mounted:function(){
        loading.set()
        axios.get('/api/v1/hosts/?limit=100').then(function(res){
            app.data.hosts = res.data.results
            app.data.total =  Math.ceil(app.data.hosts.length/app.data.pageLength)
            app.data.chosts = pagination(app.data.currenPage,app.data.pageLength, app.data.hosts)
            app.methods.renderCard(app.data.chosts) 
            // app.methods.renderCard(app.data.hosts)
            setTimeout(function(){
                loading.close()
            }, 500)
        }).catch(function(e){
            loading.close()
            alert('初始化数据失败!')
        })

         
    
    },
    init:function(){
        this.mounted()
        this.action() 
        setInterval(function(){
            app.mounted()
        }, 1000*60*3)
    }
}
