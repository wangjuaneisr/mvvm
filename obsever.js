/** 
 * Observer将普通的JS对象传递给VUE实例的data选项，
 * Vue将遍历此对象所有属性，
 * 并使用Object.defineProperty()方法将属性全部转换成setter和getter方法。
 * 当data中的属性被调用访问时，则会调用getter方法。
 * 当data中的属性被改变时，则会调用setter方法。
*/

class Observer {
    constructor(data){
        this.observe(data);
    }
    observe(data){
        //对这个data数据的原有属性改成set get的形式
        if(!data || typeof data !== 'object')return false;

        // 要将数据 一一劫持
        //先获取到data的key和value
        Object.keys(data).forEach(key=>{
            // 劫持
            this.defineReactive(data,key,data[key]);
            this.observe(data[key]);
        })
    }
    //定义响应式
    defineReactive(obj,key,value){
        let that = this;
        let dep = new Dep();
        Object.defineProperty(obj,key,{
            enumerable:true,
            configurable:true,
            get(){//当取值时调用的方法
                Dep.target && dep.addSub(Dep.target);//每个变化的数据都对应一个数组 存放所有更新的操作
                return value;
            },
            set(newValue){//设置data属性中的值
                if(newValue != value){
                    that.observe(that);//如果是对象继续去劫持
                    value = newValue;
                    dep.notify();//通知所有人数据更新
                }
                return value;
            }

        })
    }
}
/** 
 * Dep内部维护了一个数组，用来执行收集订阅者Watcher，数据变动触发notify()函数，在调用订阅者的update()方法。
*/
class Dep {
    constructor(){
        this.subs = []
    }
    addSub(watcher){
        this.subs.push(watcher);
    }
    notify(){
        this.subs.forEach(watcher=>watcher.update());
    }
}