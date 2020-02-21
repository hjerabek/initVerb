//##############################################################################################################################
//##############################################################################################################################
// initVerb - verbification function
// VERSION: 0.24.0
// TODO: build verbs from js
// TODO: allow disabling onbefore and onafter logic
// TODO: allow to automatically integrate a verb into prototypes of core classes/types
// TODO: introduce handlertype "verb" which allows chaining of verbs, i.e. the return value of the verb is used as argument for its parent
// TODO: rework verb scoping: verbs must not be bound to sscp/ascp in order to allow using verbs in prototypes
// TODO: introduce "outputscope" which allows to directly access the verb as well as all its handlers (use rdf logic)
// TODO: integrate the rdf's description and typescript functionalities
// TODO: potentially introduce "fluent" verbs, i.e. "worker verbs" that always return themselves
// TODO: potentially allow limiting the number of verb features (schemes, algorithms...)
// TODO: potentially allow ordering the priorities of verb features (schemes, algorithms...)
// TODO: potentially add polyfill for Promises (https://github.com/stefanpenner/es6-promise)
// TODO: potentially add polyfill for Function.bind (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
//##############################################################################################################################
//##############################################################################################################################
var initVerb=(function(global,module){
    // TODO: remove this after initial development phase
    var toJson=JSON.stringify;
    //var nanonow=function(){return 1000000*window.performance.now();};
    var clog=console.log;
    var clogO=(x)=>console.log(toJson(x,null,4));
    //var clogT=(s)=>{var t2=nanonow();clog("~~~~~~~~~~~~~~~~~~~~~~~~~~~ "+((t2-t1)*1e-6).toFixed(3)+" / "+((t2-t)*1e-6).toFixed(3)+(s ? " ... "+s : ""));t1=t2};
    //var t=nanonow(),t1=t;

    //##############################################################################################################################
    // main verb creation function
    var initVerb=function(opts){
        var a,o,f,sf,af,x;
        
        //==============================================================================================
        var oscp,nm,xscp,prnt,sscp,ascp;
        if (opts) {
            oscp=(opts.outputscope || opts.oscp || opts.scope || opts.scp || null);
            nm=(opts.name || opts.nm || "");            
            if (oscp) {
                if (typeof(oscp)==="string") oscp=(key2scope[oscp] || null);
                if ((f=oscp[nm]) && f.syncverbscope) return f;
            }
            xscp=(opts.executionscope || opts.xscp || opts.scope || opts.scp || null);
            prnt=(opts.parent || opts.prnt || null);
            if (prnt && typeof(prnt)==="string") prnt=(key2scope[prnt] || null);
            sscp={
                async:false,
                dflt:(opts.async || opts.a ? false : true),
                xscp:xscp,
                otpk:(opts.optionstypekey || opts.otpk || "$"),
                oscp:oscp,
                nm:nm,
                sblfy:(oscp && nm && (opts.siblify || opts.sblfy) ? true : false),
                prtp:(nm && (opts.prototype || opts.prtp) ? true : false),
                prnt:prnt
            }
        } else {
            oscp=null;
            nm="";
            xscp=null;
            prnt=null;
            sscp={
                async:false,
                dflt:true,
                otpk:"$",
                oscp:oscp,
                nm:nm,
                sblfy:false,
                prtp:false,
                prnt:null
            }
        }
        sscp.oscp=oscp;
        sscp.nm=nm;
        sscp.xscp=xscp;
        sscp.htp2k2h={};
        sscp.htp2k2dsc={};
        sscp.htp2k2bhs={};
        sscp.htp2k2ahs={};
        ascp={
            async:true,
            dflt:!sscp.dflt,
            xscp:xscp,
            otpk:sscp.otpk,
            oscp:oscp,
            nm:nm,
            sblfy:sscp.sblfy,
            prtp:sscp.prtp,
            prnt:prnt,
            htp2k2h:{},
            htp2k2dsc:sscp.htp2k2dsc,
            htp2k2bhs:sscp.htp2k2bhs,
            htp2k2ahs:sscp.htp2k2ahs
        }

        //==============================================================================================
        var isArray=initVerb.isArray;
        var isArrayLike=initVerb.isArrayLike;
        var isPromise=initVerb.isPromise;
        var type2verbargumentsrunner=initVerb.type2verbargumentsrunner;
        var fillInString=initVerb.fillInString;

        //==============================================================================================
        var sverb=function(x){
            return type2verbargumentsrunner[typeof(x)](sscp,x,arguments,xscp || this,ascp);
        }
        //==============================================================================================
        var averb=function(x){
            var v=type2verbargumentsrunner[typeof(x)](ascp,x,arguments,xscp || this,sscp);
            return (v instanceof Promise ? v : Promise.resolve(v));
        }
        
        //==============================================================================================
        sscp.sscp=ascp.sscp=sscp;
        sscp.ascp=ascp.ascp=ascp;

        sscp.v=sscp.sv=ascp.sv=sverb;
        ascp.v=ascp.av=sscp.av=averb;
        
        //==============================================================================================
        sverb.syncverbscope=averb.syncverbscope=sscp;
        sverb.asyncverbscope=averb.asyncverbscope=ascp;

        sverb.sync=averb.sync=sverb;
        sverb.async=averb.async=averb;

        //==============================================================================================
        sverb.on=sscp.on=onUnbound.bind(sscp);
        averb.on=ascp.on=onUnbound.bind(ascp);

        sverb.onbefore=sscp.onbefore=onbeforeUnbound.bind(sscp);
        averb.onbefore=ascp.onbefore=onbeforeUnbound.bind(ascp);

        sverb.onafter=sscp.onafter=onafterUnbound.bind(sscp);
        averb.onafter=ascp.onafter=onafterUnbound.bind(ascp);

        //==============================================================================================
        sverb.do=function(x){
            type2verbargumentsrunner[typeof(x)](sscp,x,arguments,xscp || this,ascp);
            return sverb;
        }
        averb.do=function(x){
            type2verbargumentsrunner[typeof(x)](ascp,x,arguments,xscp || this,sscp);
            return averb;
        }

        //==============================================================================================
        sverb.try=function(x){
            try {
                return type2verbargumentsrunner[typeof(x)](sscp,x,arguments,xscp || this,ascp);
            } catch(err) {
                return;
            }
        }
        averb.try=function(x){
            try {
                var v=type2verbargumentsrunner[typeof(x)](ascp,x,arguments,xscp || this,sscp);
                return (v instanceof Promise ? v : Promise.resolve(v));
            } catch(err) {
                return Promise.reject(err);
            }
        }

        //==============================================================================================
        sverb.do.try=sverb.try.do=sverb.trydo=sverb.dotry=function(x){
            try { type2verbargumentsrunner[typeof(x)](sscp,x,arguments,xscp || this,ascp); } catch(err) {};
            return sverb;
        }
        averb.do.try=averb.try.do=averb.trydo=averb.dotry=function(x){
            try { type2verbargumentsrunner[typeof(x)](ascp,x,arguments,xscp || this,sscp); } catch(err) {};
            return averb;
        }

        //==============================================================================================
        sverb.all=function(){
            var i,n=arguments.length,x,ps=[];
            for (i=0;i<n;i++) ps.push(isArray(x=arguments[i]) ? sverb.apply(this,x) : sverb.call(this,x))
            return Promise.all(ps);
        }
        averb.all=function(){
            var i,n=arguments.length,x,ps=[];
            for (i=0;i<n;i++) ps.push(isArray(x=arguments[i]) ? averb.apply(this,x) : averb.call(this,x))
            return Promise.all(ps);
        }

        //==============================================================================================
        sverb.race=function(){
            var i,n=arguments.length,x,ps=[];
            for (i=0;i<n;i++) ps.push(isArray(x=arguments[i]) ? sverb.apply(this,x) : sverb.call(this,x))
            return Promise.race(ps);
        }
        averb.race=function(){
            var i,n=arguments.length,x,ps=[];
            for (i=0;i<n;i++) ps.push(isArray(x=arguments[i]) ? averb.apply(this,x) : averb.call(this,x))
            return Promise.race(ps);
        }

        //==============================================================================================
        sverb.any=function(){
            var i,n=arguments.length,x,ps=[];
            for (i=0;i<n;i++) ps.push(isArray(x=arguments[i]) ? sverb.apply(this,x) : sverb.call(this,x))
            return Promise.any(ps);
        }
        averb.any=function(){
            var i,n=arguments.length,x,ps=[];
            for (i=0;i<n;i++) ps.push(isArray(x=arguments[i]) ? averb.apply(this,x) : averb.call(this,x))
            return Promise.any(ps);
        }

        //==============================================================================================
        sverb.fillIn=function(x,name){
            return fillInString(x,sverb,xscp,name);
        }
        averb.fillIn=function(s,name){
            return fillInString(x,averb,xscp,name);
        }

        //==============================================================================================
        sverb.createDts=averb.createDts=function(name){
            return createDts(sscp,ascp,name);
        }

        //==============================================================================================
        if (sscp.prtp) {
            // TODO: test this thoroughly (especially the string prototype)
            // TODO: missing support for async handlers
            // TODO: prevent overwriting of existing prototypes [?]
            var aprtpunshift=Array.prototype.unshift;
            Object.defineProperty(Boolean.prototype,nm,{
                enumerable:false,writable:true,configurable:true,
                value:function(){
                    var n=arguments.length,h=sscp.t2h["boolean"];
                    if (n<1) return h.call(xscp,this.valueOf());
                    if (n==1) return h.call(xscp,this.valueOf(),arguments[0]);
                    if (n==2) return h.call(xscp,this.valueOf(),arguments[0],arguments[1]);
                    aprtpunshift.call(arguments,this.valueOf());
                    return h.apply(xscp,arguments);
                }
            });
            Object.defineProperty(Number.prototype,nm,{
                enumerable:false,writable:true,configurable:true,
                value:function(){
                    var n=arguments.length,h=sscp.t2h["number"];
                    if (n<1) return h.call(xscp,this.valueOf());
                    if (n==1) return h.call(xscp,this.valueOf(),arguments[0]);
                    if (n==2) return h.call(xscp,this.valueOf(),arguments[0],arguments[1]);
                    aprtpunshift.call(arguments,this.valueOf());
                    return h.apply(xscp,arguments);
                }
            });
            // TODO: missing usage of "" handlers
            Object.defineProperty(String.prototype,nm,{
                enumerable:false,writable:true,configurable:true,
                value:function(s){
                    var h=(sscp.k2h[s] || sscp.s2h[s]);
                    if (h) {
                        s=this.valueOf();
                        return h.apply(xscp,arguments);
                    }
                    h=sscp.t2h["string"];
                    var n=arguments.length;
                    if (n<1) return h.call(xscp,this.valueOf());
                    if (n==1) return h.call(xscp,this.valueOf(),arguments[0]);
                    if (n==2) return h.call(xscp,this.valueOf(),arguments[0],arguments[1]);
                    aprtpunshift.call(arguments,this.valueOf());
                    return h.apply(xscp,arguments);
                }
            });
            Object.defineProperty(Array.prototype,nm,{
                enumerable:false,writable:true,configurable:true,
                value:function(){
                    var n=arguments.length,h=sscp.t2h["array"];
                    if (n<1) return h.call(xscp,this);
                    if (n==1) return h.call(xscp,this,arguments[0]);
                    if (n==2) return h.call(xscp,this,arguments[0],arguments[1]);
                    aprtpunshift.call(arguments,this);
                    return h.apply(xscp,arguments);
                }
            });
            Object.defineProperty(Date.prototype,nm,{
                enumerable:false,writable:true,configurable:true,
                value:function(){
                    var n=arguments.length,h=sscp.t2h["date"];
                    if (n<1) return h.call(xscp,this);
                    if (n==1) return h.call(xscp,this,arguments[0]);
                    if (n==2) return h.call(xscp,this,arguments[0],arguments[1]);
                    aprtpunshift.call(arguments,this);
                    return h.apply(xscp,arguments);
                }
            });
            Object.defineProperty(RegExp.prototype,nm,{
                enumerable:false,writable:true,configurable:true,
                value:function(){
                    var n=arguments.length,h=sscp.t2h["regexp"];
                    if (n<1) return h.call(xscp,this);
                    if (n==1) return h.call(xscp,this,arguments[0]);
                    if (n==2) return h.call(xscp,this,arguments[0],arguments[1]);
                    aprtpunshift.call(arguments,this);
                    return h.apply(xscp,arguments);
                }
            });
            if (typeof(Promise)!=="undefined") Object.defineProperty(Promise.prototype,nm,{
                enumerable:false,writable:true,configurable:true,
                value:function(){
                    var n=arguments.length,h=sscp.t2h["promise"];
                    if (n<1) return h.call(xscp,this);
                    if (n==1) return h.call(xscp,this,arguments[0]);
                    if (n==2) return h.call(xscp,this,arguments[0],arguments[1]);
                    aprtpunshift.call(arguments,this);
                    return h.apply(xscp,arguments);
                }
            });
            if (typeof(Client)!=="undefined") Object.defineProperty(Client.prototype,nm,{
                enumerable:false,writable:true,configurable:true,
                value:function(){
                    var n=arguments.length,h=sscp.t2h["client"];
                    if (n<1) return h.call(xscp,this);
                    if (n==1) return h.call(xscp,this,arguments[0]);
                    if (n==2) return h.call(xscp,this,arguments[0],arguments[1]);
                    aprtpunshift.call(arguments,this);
                    return h.apply(xscp,arguments);
                }
            });
            Object.defineProperty(Function.prototype,nm,{
                enumerable:false,writable:true,configurable:true,
                value:function(){
                    var n=arguments.length,h=sscp.t2h["function"];
                    if (n<1) return h.call(xscp,this);
                    if (n==1) return h.call(xscp,this,arguments[0]);
                    if (n==2) return h.call(xscp,this,arguments[0],arguments[1]);
                    aprtpunshift.call(arguments,this);
                    return h.apply(xscp,arguments);
                }
            });
        }

        //==============================================================================================
        // TODO: add a handler type "verb"/"v" which automatically combines verbs
        addScpHtp(sscp,ascp,["key","algorithm",""]);
        addScpHtp(sscp,ascp,["uri","scheme"]);
        addScpHtp(sscp,ascp,["options","opts",sscp.otpk]);
        addScpHtp(sscp,ascp,["type","instance"]);

        //==============================================================================================
        f=(sscp.dflt ? sverb : averb);
        // TODO: potentially use "Object.defineProperty"
        if (oscp && nm) oscp[nm]=f;
        initVerb.verbs.push(f);

        //==============================================================================================
        return f;
    };

    //##############################################################################################################################
    initVerb.global=global;
    initVerb.verbs=[];

    //##############################################################################################################################
    // define map of core output scopes
    var key2scope=initVerb.key2scope={
        global:global,
        g:global,
        G:global
    }

    //==============================================================================================
    // define map of core prototype scopes
    var key2prototype=initVerb.key2prototype={
        boolean:Boolean.prototype,
        number:Number.prototype,
        string:String.prototype,
        //object:Object.prototype,
        array:Array.prototype,
        date:Date.prototype,
        regexp:RegExp.prototype,
        promise:(typeof(Promise)==="undefined" ? {} : Promise.prototype),
        client:(typeof(Client)==="undefined" ? {} : Client.prototype),
        function:Function.prototype
    }

    //##############################################################################################################################
    var toJson=JSON.stringify;
    var fromJson=JSON.parse;

    //##############################################################################################################################
    // polyfill for Function .bind (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
    if (!Function.prototype.bind) (function(){
        var slice = Array.prototype.slice;
        Function.prototype.bind = function() {
            var thatFunc = this, thatArg = arguments[0];
            if (typeof thatFunc !== 'function') {
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }
            var args = slice.call(arguments, 1);
            return function(){
                var funcArgs = args.concat(slice.call(arguments))
                return thatFunc.apply(thatArg, funcArgs);
            };
        };
    })();

    //##############################################################################################################################
    // gets/extracts a value from a deep object, using slash ("/") as separator and assuming it has already been found
    var getDOV_slashfound=initVerb.getDOV_slashfound=function(o,k,i10){
        var i=0,i1=i10,o1=o;
        while (i1>=0) {
            o1=o1[k.substring(i,i1)];
            if (!o1) return;
            i=i1+1;
            i1=k.indexOf("/",i);
        }
        return o1[k.substring(i)];
    }

    //##############################################################################################################################
    var isArray=initVerb.isArray=function(x){
        return x instanceof Array;
    };

    //==============================================================================================
    var isArrayLike=initVerb.isArrayLike=function(x){
        return x instanceof Array;
    };

    //##############################################################################################################################
    var getInstanceName=initVerb.getInstanceName=function(x){
        try {
            return x.constructor.name.toLowerCase();
        } catch(err) {
            return "";
        }
    };

    //##############################################################################################################################
    // async-/promise-related functions
    var isPromise=initVerb.isPromise=function(x){
        return x instanceof Promise;
    };

    //##############################################################################################################################
    // TODO: use this to truely asynchronize sync function called by async verbs
    var isVertx=(typeof(vertx)!=="undefined" && vertx.executeBlocking ? true : false);
    var returnTrue=function(){return true;};
    var runAsync=initVerb.runAsync=(isVertx ? function(f,args,scope){
        return new Promise(function(resolve,reject){
            vertx.executeBlocking(function(ftr){
                try {
                    resolve(f.apply(scope,args));
                    ftr.complete(true);
                } catch(err1) {
                    reject(err1.toString());
                    ftr.complete(false);
                }
            },false,returnTrue);
        });
    } : function(f,args,scope){
        return new Promise(function(resolve,reject){
            setTimeout(function(){
                try {
                    resolve(f.apply(scope,args));
                } catch(err1) {
                    reject(err1.toString());
                }
            },1);
        })
    });

    //##############################################################################################################################
    // runs multiple functions with error suppression
    var tryMultiapply=initVerb.tryMultiapply=function(a,args,scope){
        //if (!scope) scope=this;
        var i,n=a.length;
        for (i=0;i<n;i++) {
            try { a[i].apply(scope || this,args); } catch(err) {}
        }
        return;
    };

    //##############################################################################################################################
    var type2verbargumentsrunner=initVerb.type2verbargumentsrunner={};

    //==============================================================================================
    var runVerbArguments_string=type2verbargumentsrunner["string"]=function(vscp,x,args,xscp,vscp1){
        var n,k,a,f,v;
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // check for registered algorithm handler
        if (f=vscp.a2h[x]) {
            if (a=vscp.a2bhs[k=x]) tryMultiapply(a,args,xscp);
            args[0]=xscp;
            v=f.call.apply(f,args);
            if (a=vscp.a2ahs[k]) tryMultiapply(a,args,xscp);
            return v;
        }
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // check for registered scheme handler
        n=x.indexOf(":");
        if (n<0) {
            if (f=vscp.s2h[x]) {
                if (a=vscp.s2bhs[k=x]) tryMultiapply(a,args,xscp);
                args[0]="";
                v=f.apply(xscp,args);
                if (a=vscp.s2ahs[k]) tryMultiapply(a,args,xscp);
                return v;
            }
        } else if (f=vscp.s2h[k=x.substring(0,n)]) {
            if (a=vscp.s2bhs[k]) tryMultiapply(a,args,xscp);
            args[0]=x.substring(n+1);
            v=f.apply(xscp,args);
            if (a=vscp.s2ahs[k]) tryMultiapply(a,args,xscp);
            return v;
        }
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // check for deep handler
        n=x.indexOf("/");
        if (n>=0 && (f=getDOV_slashfound(vscp.v,x,n))) {
            args[0]=xscp;
            v=f.call.apply(f,args);
            return v;
        }
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // check for default algorithm-based handler
        if (f=vscp.a2h[""]) {
            if (a=algorithm2beforehandlers[""]) tryMultiapply(a,args,xscp);
            v=f.apply(xscp,args);
            if (a=algorithm2afterhandlers[""]) tryMultiapply(a,args,xscp);
            return v;
        }
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // check for default scheme-based handler
        if (f=vscp.s2h[""]) {
            if (a=vscp.s2bhs[""]) tryMultiapply(a,args,xscp);
            v=f.apply(xscp,args);
            if (a=vscp.s2ahs[""]) tryMultiapply(a,args,xscp);
            return v;
        }
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // check for default string handler
        if (f=vscp.t2h["string"]) {
            if (a=vscp.t2bhs["string"]) tryMultiapply(a,args,xscp);
            v=f.apply(xscp,args);
            if (a=vscp.t2ahs["string"]) tryMultiapply(a,args,xscp);
            return v;
        }
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        if (vscp1) return runVerbArguments_string(vscp1,x,args,xscp);
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        throw "errVerbCannotHandleStringArgument "+x;
    }

    //==============================================================================================
    var runVerbArguments_object=type2verbargumentsrunner["object"]=function(vscp,x,args,xscp,vscp1){
        var k,a,f,v;
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // check for options handler
        if ((k=x[vscp.otpk]) && (f=vscp.o2h[k])) {
            if (a=vscp.o2bhs[k]) tryMultiapply(a,args,xscp);
            v=f.apply(xscp,args);
            if (a=vscp.o2ahs[k]) tryMultiapply(a,args,xscp);
            return v;
        }
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // check for default instance/object handler
        if (f=(vscp.t2h[k=getInstanceName(x)] || vscp.t2h[k="object"])) {
            if (a=vscp.t2bhs[k]) tryMultiapply(a,args,xscp);
            v=f.apply(xscp,args);
            if (a=vscp.t2ahs[k]) tryMultiapply(a,args,xscp);
            return v;
        }
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        if (vscp1) return runVerbArguments_object(vscp1,x,args,xscp);
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        throw "errVerbCannotHandleObjectArgument "+x;
    }

    //==============================================================================================
    var runVerbArguments_boolean=type2verbargumentsrunner["boolean"]=function(vscp,x,args,xscp,vscp1){
        var a,f,v;
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // check for registered type handler
        if (f=vscp.t2h["boolean"]) {
            if (a=vscp.t2bhs["boolean"]) tryMultiapply(a,args,xscp);
            v=f.apply(xscp,args);
            if (a=vscp.t2ahs["boolean"]) tryMultiapply(a,args,xscp);
            return v;
        }
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        if (vscp1) return runVerbArguments_boolean(vscp1,x,args,xscp);
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        throw "errVerbCannotHandleBooleanArgument "+x;
    }

    //==============================================================================================
    var runVerbArguments_number=type2verbargumentsrunner["number"]=function(vscp,x,args,xscp,vscp1){
        var a,f,v;
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // check for registered type handler
        if (f=vscp.t2h["number"]) {
            if (a=vscp.t2bhs["number"]) tryMultiapply(a,args,xscp);
            v=f.apply(xscp,args);
            if (a=vscp.t2ahs["number"]) tryMultiapply(a,args,xscp);
            return v;
        }
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        if (vscp1) return runVerbArguments_number(vscp1,x,args,xscp);
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        throw "errVerbCannotHandleNumberArgument "+x;
    }

    //==============================================================================================
    var runVerbArguments_function=type2verbargumentsrunner["function"]=function(vscp,x,args,xscp,vscp1){
        var a,f,v;
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // check for registered type handler
        if (f=vscp.t2h["function"]) {
            if (a=vscp.t2bhs["function"]) tryMultiapply(a,args,xscp);
            v=f.apply(xscp,args);
            if (a=vscp.t2ahs["function"]) tryMultiapply(a,args,xscp);
            return v;
        }
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        if (vscp1) return runVerbArguments_function(vscp1,x,args,xscp);
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        throw "errVerbCannotHandleFunctionArgument";
    }

    //==============================================================================================
    var runVerbArguments_undefined=type2verbargumentsrunner["undefined"]=function(vscp,x,args,xscp,vscp1){
        var a,f,v;
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // check for registered type handler
        if (f=vscp.t2h["undefined"]) {
            if (a=vscp.t2bhs["undefined"]) tryMultiapply(a,args,xscp);
            v=f.apply(xscp,args);
            if (a=vscp.t2ahs["undefined"]) tryMultiapply(a,args,xscp);
            return v;
        }
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        if (vscp1) return runVerbArguments_undefined(vscp1,x,args,xscp);
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        throw "errVerbCannotHandleUndefinedArgument";
    }

    //##############################################################################################################################
    // creates an options-processing function from an arguments-processing function
    var rxGetJavascriptVariable=/[a-zA-Z$_][a-zA-Z0-9$_]*/;
    var createOptionsFunction=initVerb.createOptionsFunction=function(fnctn,description){
        var i,a,js=["return this("];
        // TODO: determine description from the handler's arguments names if no description is provided
        for (i=2;i<description.length;i+=2) {
            if (a=description[i].match(rxGetJavascriptVariable)) js.push(i==2 ? '' : ',','o["'+a[0]+'"]');
        }
        js.push(");");
        return (new Function("o",js.join(""))).bind(fnctn);
    };

    //##############################################################################################################################
    // adds argument handlers to the verb
    // TODO: handlers should be overwritten by default
    // TODO: creation of options functions should be optional
    // TODO: scheme handlers should automatically be registered as algorithms (if not already defined)
    // TODO: "on" should allow to selective en-/disable siblify and prototype via arguments
    // TODO: allow using "#" as control char (0) for handler with type "type"/"instance"
    var rxMatchCamelcase=/([a-z0-9])([A-Z])/;
    var k2htp={
        "undefined":"type","boolean":"type","number":"type","string":"type","object":"type","function":"type",
        "array":"instance","date":"instance","regexp":"instance","promise":"instance"
    }
    var onUnbound=initVerb.onUnbound=function(uri,f,dsc){
        var i,k,k1,mp,dscmp,v=this.v,mpO,fO;
        if (typeof(uri)!=="string") {
            for (i=0;i<uri.length;i++) this.on(uri[i],f,dsc);
            return v;
        }
        if (k2htp[uri]) {
            mp=this.t2h;
            if (dsc) {
                dscmp=this.t2dsc[k];
                if (typeof(dsc)!=="string" && dsc.length>2) fO=createOptionsFunction(f,dsc);
            }
            k=uri;
        } else if ((i=uri.indexOf(":"))<0) {
            if (uri.charCodeAt(0)==36) { // $...
                mp=this.o2h;
                if (dsc) dscmp=this.o2dsc;
                k=uri.substring(1);
            } else {
                mp=this.k2h;
                if (dsc) {
                    dscmp=this.k2dsc;
                    if (typeof(dsc)!=="string" && dsc.length>2) fO=createOptionsFunction(f,dsc);
                }
                k=uri;
            }
        } else if (i==uri.length-1) {
            k=uri.substring(0,i);
            mp=this.s2h;
            if (dsc) {
                dscmp=this.s2dsc;
                if (typeof(dsc)!=="string" && dsc.length>2) fO=createOptionsFunction(f,dsc);
            }
        } else {
            k=uri.substring(0,i);
            mp=this.htp2k2h[k];
            if (dsc) {
                dscmp=this.htp2k2dsc[k];
                if (typeof(dsc)!=="string" && dsc.length>2 && mp!==this.o2h) fO=createOptionsFunction(f,dsc);
            }
            k=uri.substring(i+1);
        }
        k1=k;
        mp[k1]=f;
        if (dscmp) {
            dscmp[k1]=dsc;
            if (fO) this.o2h[k1]=fO;
        }
        if (!k1) return v;
        v[k1]=f;
        // TODO: this should be handled with a separate "onUnbound_sblfy" function in order to avoid having to check each time
        if (this.sblfy) {
            k1=this.nm+k1.charAt(0).toUpperCase()+k1.substring(1);
            if (!this.oscp[k1]) this.oscp[k1]=f;
        }
        k1=k.toLowerCase();
        if (k1==k) return v;
        if (!mp[k1]) mp[k1]=f;
        if (!v[k1]) v[k1]=f;
        if (dscmp) {
            dscmp[k1]=dsc;
            if (fO) this.o2h[k1]=fO;
        }
        k1=k.replace(rxMatchCamelcase,"$1_$2").toLowerCase();
        if (k1!=k) {
            if (!mp[k1]) mp[k1]=f;
            if (!v[k1]) v[k1]=f;
            if (dscmp) {
                dscmp[k1]=dsc;
                if (fO) this.o2h[k1]=fO;
            }
        }
        return v;
    }

    //==============================================================================================
    // adds event handlers for the respective arguments handler which get executed BEFORE the arguments handler
    // TODO: add an "iInsert" option that allows to insert the handler at an arbitrary position within the handler array
    var onbeforeUnbound=initVerb.onbeforeUnbound=function(uri,h){
        var i=uri.indexOf(":"),mp,k1,a;
        if (i<0) {
            mp=this.htp2k2bhs[""];
            if (a=mp[uri]) a.push(h);
            else mp[uri]=[h];
        } else {
            mp=this.htp2k2bhs[uri.substring(0,i)];
            if (a=mp[k1=uri.substring(i+1)]) a.push(h);
            else mp[k1]=[h];
        }
        return this.v;
    }

    //==============================================================================================
    // adds event handlers for the respective arguments handler which get executed AFTER the arguments handler
    // TODO: add an "iInsert" option that allows to insert the handler at an arbitrary position within the handler array
    var onafterUnbound=initVerb.onafterUnbound=function(uri,h){
        var i=uri.indexOf(":"),mp,k1,a;
        if (i<0) {
            mp=this.htp2k2ahs[""];
            if (a=mp[uri]) a.push(h);
            else mp[uri]=[h];
        } else {
            mp=this.htp2k2ahs[uri.substring(0,i)];
            if (a=mp[k1=uri.substring(i+1)]) a.push(h);
            else mp[k1]=[h];
        }
        return this.v;
    }

    //##############################################################################################################################
    // creates a function which runs a base function with a scheme prefixed to the first argument
    // TODO: handle case where "k" is an array
    var createSchemeApplier=initVerb.createSchemeApplier=function(scm,f,scp){
        return function(k){
            k=scm+":"+k;
            return f.apply(scp || this,arguments);
        }
    }

    //==============================================================================================
    // adds a handler type to a verb scope
    var addScpHtp=initVerb.addScpHtp=function(sscp,ascp,htpks){
        var i,k,a,htp;
        var xscp=sscp.xscp,sv=sscp.v,av=ascp.v;
        var shtp2k2h=sscp.htp2k2h,ahtp2k2h=ascp.htp2k2h;
        var sk2h={},ak2h={};
        var htp2k2dsc=sscp.htp2k2dsc,htp2k2bhs=sscp.htp2k2bhs,htp2k2ahs=sscp.htp2k2ahs;
        var k2dsc={},k2bhs={},k2ahs={};

        a=[];
        for (i=0;i<htpks.length;i++) {
            k=(htpks[i] || "");
            if (k.length<2) a.push(k);
            else a.push(k,k.charAt(0));
        }
        k=a[0];
        var son=createSchemeApplier(k,sv.on,xscp);
        var sonbefore=createSchemeApplier(k,sv.onbefore,xscp);
        var sonafter=createSchemeApplier(k,sv.onafter,xscp);
        var aon=createSchemeApplier(k,av.on,xscp);
        var aonbefore=createSchemeApplier(k,av.onbefore,xscp);
        var aonafter=createSchemeApplier(k,av.onafter,xscp);
        for (i=0;i<a.length;i++) {
            htp=a[i];
            shtp2k2h[htp]=sk2h;
            ahtp2k2h[htp]=ak2h;
            htp2k2dsc[htp]=k2dsc;
            htp2k2bhs[htp]=k2bhs;
            htp2k2ahs[htp]=k2ahs;
            if (!htp) continue;
            if (htp.length==1) {
                sscp[htp+"2h"]=sk2h;
                ascp[htp+"2h"]=ak2h;
                sscp[htp+"2dsc"]=ascp[htp+"2dsc"]=k2dsc;
                sscp[htp+"2bhs"]=ascp[htp+"2bhs"]=k2bhs;
                sscp[htp+"2ahs"]=ascp[htp+"2ahs"]=k2ahs;
            } else {
                k=(htp.length<2 ? htp.toUpperCase() : htp);
                sv["on"+k]=son;
                sv["onbefore"+k]=sonbefore;
                sv["onafter"+k]=sonafter;
                av["on"+k]=aon;
                av["onbefore"+k]=aonbefore;
                av["onafter"+k]=aonafter;
            }
        }
    }

    //##############################################################################################################################
    // fill a string with values returned by the given verb
    var fillInString=initVerb.fillInString=function(s,v,xscp,name){
        var k0="#"+(name || "")+"{",i0=s.indexOf(k0);
        if (i0<0) return s;
        if (!xscp) xscp=this;
        var i1=0,di0=k0.length,sa=[],cc,x;
        while (i0>=i1) {
            sa.push(s.substring(i1,i0));
            i0+=di0;
            cc=s.charCodeAt(i0);
            // handle "
            if (cc==34) {
                i1=s.indexOf('"}',i0+1);
                if (i1<0) return sa.join("");
                //x=v.call(xscp,s.substring(i0+1,i1));
                // TODO: create a subversion of "runVerbArguments" that only handles strings, and use it here
                try { x=v(s.substring(i0+1,i1)); } catch(err1) { x=""; }
                i1+=2;
            // handle {
            } else if (cc==123) {
                i1=s.indexOf('}}',i0);
                if (i1<0) return sa.join("");
                //x=v.call(xscp,fromJson(s.substring(i0,i1+1)));
                // TODO: create a subversion of "runVerbArguments" that only handles objects, and use it here
                try { x=v(fromJson(s.substring(i0,i1+1))); } catch(err1) { x=""; }
                i1+=2;
            // handle [
            } else if (cc==91) {
                i1=s.indexOf(']}',i0);
                if (i1<0) return sa.join("");
                try { x=v.apply(xscp,fromJson(s.substring(i0,i1+1))); } catch(err1) { x=""; }
                i1+=2;
            // handle default string
            } else {
                i1=s.indexOf('}',i0);
                if (i1<0) return sa.join("");
                //x=v.call(xscp,s.substring(i0,i1));
                // TODO: create a subversion of "runVerbArguments" that only handles strings, and use it here
                try { x=v(s.substring(i0,i1)); } catch(err1) { x=""; }
                i1+=1;
            }
            if (x) {
                // TODO: handle filling of async results (see placeholder logic for browsers in rdf)
                if (x instanceof Promise) sa.push("");
                else sa.push(x);
            }
            i0=s.indexOf(k0,i1);
        }
        return sa.join("");
    }

    //##############################################################################################################################
    var okeys=Object.keys;
    var aextend=function(a0,a1){
        for (var i=0,n=a1.length;i<n;i++) a0.push(a1);
        return a0;
    }
    var aunique=function(a){
        for (var i=0,n=a.length,o={};i<n;i++) o[a[i]]=true;
        return okeys(o);
    }
    // TODO: under construction - finish this
    var createDts=initVerb.createDts=function(sscp,ascp,name){
        var i,a,k,rx,x,verb,ts=[];
        if (!name) name=(sscp.nm || "nonameverb");
        a=aunique(aextend(okeys(sscp.k2h),okeys(ascp.k2h)));
        ts.push('declare type key_$NAME = '+(a.length ? '"'+a.join('" | "')+'" | ' : '')+'Object;');
        a=aunique(aextend(okeys(sscp.s2h),okeys(ascp.s2h)));
        ts.push('declare type scheme_$NAME = '+(a.length ? '"'+a.join('" | "')+'" | ' : '')+'Object;');
        a=aunique(aextend(okeys(sscp.o2h),okeys(ascp.o2h)));
        ts.push('declare type optionstype_$NAME = '+(a.length ? '"'+a.join('" | "')+'" | ' : '')+'Object;');
        a=aunique(aextend(okeys(sscp.t2h),okeys(ascp.t2h)));
        ts.push('declare type type_$NAME = '+(a.length ? '"'+a.join('" | "')+'" | ' : '')+'Object;');
        ts.push('declare type argument_$NAME = '+["key_$NAME","scheme_$NAME","Object"].join(" | ")+';');
        ts.push('declare type verb_$NAME = ((x:argument_$NAME)=>any) | {','"$":optionstype_$NAME,');
        verb=sscp.v;
        rx=/^(on|onbefore|onafter)/;
        for (k in verb) {
            if (rx.test(k)) ts.push('/** add handler */','"'+k+'":(x:key_$NAME | scheme_$NAME | type_$NAME | Object,...args:any[])=>verb_$NAME,');
            else ts.push('"'+k+'":any,');
        }
        ts.push('[key:string]:any','};');
        ts.push('declare var $NAME:verb_$NAME;');
        return ts.join("\n").replace(/\$NAME/g,name); 
    }

    //##############################################################################################################################
    // globalize, export and return the verb creator
    global.initVerb=initVerb;
    module.exports=initVerb;
    return initVerb;
})(
    typeof(global)!=="undefined" ? global : (typeof(window)!=="undefined" ? window : (typeof(applicationScope)!=="undefined" ? applicationScope : {})),
    typeof(module)!=="undefined" ? module : {}
);
//##############################################################################################################################
//##############################################################################################################################
