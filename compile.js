/** 
 * Compiler 的作用是对每个元素节点的指令进行解析，替换模板数据，并绑定对应的更新函数，初始化相应的订阅。
*/

class Compile{
    constructor(el,vm){

        this.el = this.isElementNode(el) ? el: document.querySelector(el);// #app document.getElementById
        this.vm = vm;

        //如果这个元素能够获取到 才开始编译

        if(this.el){

            //1 先把这些真实的DOM移入到内存（fragment）中
            let fragment = this.node2fragment(this.el);

            //2 编译 =》 提取想要的元素节点v-model的文本节点 {{}}
            this.compile(fragment);

            //3 把编译好的的fragment 再塞回页面里面去
            this.el.appendChild(fragment);

        }
    }
  // 专门写一些辅助的方法

    //是否文本节点
    isElementNode(node){
        return node.nodeType === 1;
    }

    //是否指令
    isDirective(name){
        return name.includes('v-');
    }

//    核心的方法

    //元素编译
    compileElement(node){
        //带v-model
        let attr = node.attributes;
        Array.from(attr).forEach(attr=>{
            // attr.value;  判断属性名是否有v-
            let attrName = attr.name;
            let [,type] =attrName.split('-');
            if(this.isDirective(attrName)){
                //取到对应的值放到节点中
                let expr = attr.value;
                //node this.vm.$data expr
                CompileUtil[type](node,this.vm,expr);
            }

        })
    }
    //文本编译
    compileText(node){
        //带{{asd}}
        let expr = node.textContent;//取文本中的内容
        let reg = /\{\{([^}]+)\}\}/g;

        if(reg.test(expr)){
            //node this.vm.$data text
            CompileUtil['text'](node,this.vm,expr)
        }


    }
    compile(fragment){
        // 需要递归
        let childNodes = fragment.childNodes;
        //文档元素转数组
        Array.from(childNodes).forEach(node=>{
            if(this.isElementNode(node)){
                //是元素节点
                //编译元素
                this.compileElement(node);
                // 需要深入检查
                this.compile(node);
            }else{
                //文本节点
                this.compileText(node);
                //编译元素文本
                // console.log('text',node)
            }
        })
    }
    node2fragment(el){//需要将el中的内容放到内存中

        //文档碎片 内存中的dom节点
        let fragment = document.createDocumentFragment();
        let firstChild;
        while (firstChild = el.firstChild){
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
}
CompileUtil = {
    getVal(vm,expr){//获取实例上对应的数据
        expr = expr.split('.');
        return expr.reduce((prev,next)=>{
            return prev[next];
        },vm.$data)
    },
    getTextVal(vm,expr){
        return expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            return this.getVal(vm,arguments[1])
        })
    },
    text(node,vm,expr){//文本处理
        let updateFn = this.updater['textUpdater'];
        // // m.$data[expr] message.a => [message,a];
        let value = this.getTextVal(vm,expr);
        expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            new Watcher(vm,arguments[1],(newValue)=>{
                //如果数据变化了 文本节点需要重新获取依赖的属性更新文本中的内容
                updateFn && updateFn(node,this.getTextVal(vm,expr))
            });
        })

        updateFn && updateFn(node,value)

    },
    setVal(vm,expr,value){
        expr = expr.split('.');
        return expr.reduce((prev,next,currentIndex)=>{
            if (currentIndex === expr.length-1) {
                return prev[next] = value;
            }
            return prev[next];
        },vm.$data)
    },
    model(node,vm,expr){//输入框处理
        let updateFn = this.updater['modelUpdater'];
        // m.$data[expr] message.a => [message,a];
        //增加监控 数据发生变化时 调用watch的callback
        new Watcher(vm,expr,(newValue)=>{
            //当值变化后 会调用cb 将新的值传过来
            updateFn && updateFn(node,this.getVal(vm,expr))
        });
        node.addEventListener('input',(e)=>{
            let newValue = e.target.value;
            this.setVal(vm,expr,newValue)
        })

        updateFn && updateFn(node,this.getVal(vm,expr))
    },
    updater:{
        //文本更新
        textUpdater(node,value){
            node.textContent = value;
        },
        //数据更新
        modelUpdater(node,value){
            node.value = value;
        }

    }
}

