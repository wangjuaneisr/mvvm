/** 
 * Watcher作为连接Observer和Compiler的桥梁，能够订阅并接收每个属性变动的通知，执行指令绑定相应回调函数。
*/
//观察者的目的 ： 给需要变化的元素增加一个观察者，当数据变化后 执行对应的方法
class Watcher{
    constructor(vm,expr,cb){
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        //先获取原来的值
        this.value = this.get();
    }

    getVal(vm,expr){//获取实例上对应的数据
        expr = expr.split('.');
        return expr.reduce((prev,next)=>{
            return prev[next];
        },vm.$data)
    }

    get(){
        Dep.target = this;
        let value = this.getVal(this.vm,this.expr);
        return value;
    }

    //对外暴露的方法
    update(){
        let newValue = this.getVal(this.vm,this.expr);
        let oldValue = this.value;
        if(oldValue != newValue){
            this.cb(newValue);
        }
    }
    //用新值和原来的值进行对比，如果发生变化 就调用更新方法
}