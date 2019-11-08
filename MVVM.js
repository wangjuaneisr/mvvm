class MVVM{
    constructor(options){
        //先把可用的东西挂载在实例上
        this.$el = options.el;
        this.$data = options.data;
        //若有需要编译的模板 就开始编译
        if(this.$el){
            //编译之前先进行数据劫持 就是把对象的所有属性改成set和get方法
            new Observer(this.$data);
            this.proxyData(this.$data);
            //用数据和元素进行编译
            new Compile(this.$el,this)
        }
    }
    //把vm.$data 代理到 vm
    proxyData(data){
        Object.keys(data).forEach(key=>{
            Object.defineProperty(this,key,{
                get(){
                    return data[key]
                },
                set(newValue){
                    data[key] = newValue;
                }
            })
        })
    }
}
