$(function(){
 

    $('#sigup-form').validate({
        rules : {
            username : {
                minlength : 3
            },
            password : {
                minlength : 5
            },
            password_confirm : {
                minlength : 5,
                equalTo : "#password"
            }
        },
        highlight: function (input) {
            $(input).parents('.input-group').addClass('error');
        },
        unhighlight: function (input) {
            $(input).parents('.input-group').removeClass('error');
        },
        errorPlacement: function (error, element) {
            $(element).parents('.input-group').append(error);
        },
        submitHandler: function(form, e) {
            e.preventDefault()
            var sdata = objectifyForm($(form).serializeArray())
            layer.load()
            axios({
                url:'/api/v1/user/sigup/',
                method:'post',
                data:sdata
            }).then(function(res){
                layer.msg('注册成功，正在跳转登录页面!', {icon:1})
                setTimeout(function(){
                    location.href= '/login/'
                }, 500) 
            }).catch(function(e){
                console.log(e.response)
                layer.closeAll('loading')
                layer.msg('注册失败,失败原因:'+e.response.data.msg, {icon:2})
            })
        }
    });
})