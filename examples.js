if (typeof(initVerb)!=="function" && typeof(require)==="function") require("./initVerb.js");
//#####################################################
//#####################################################
// EXAMPLES
// the following examples/snippets create and use a stringification function/verb "str" and a logging function/verb "log"
// i.e. not all examples must be practical or meaningful - their only purpose is to demonstrate the usage syntax of verbs
//#####################################################
//#####################################################

// dummy variables for measuring execution time etc.
var t0=Date.now();

//#####################################################
// create a default verb
var str=initVerb();

// create a verb with custom options (all optional)
// here, log does not have to be declared (var) because it will be initialized within the global scope
initVerb({
    // if true, the verb will be async by default, i.e. it will always return with a Promise (shorthand="a")
    // if you want to specifically force sync or async executions, use "verb.sync(...)" or "verb.async(...)" respectively
    "async":false,
    // the default execution scope of the verb, i.e. its "this" (shorthand="xscp")
    // if not provided, that scope will be the scope of "initVerb"
    "executionscope":null,
    // the property key holding the optionstype in options objects (shorthand="otpk")
    "optionstypekey":"$",
    // if provided, the verb as well as its handlers will be added to the given scope object (shorthand="oscp")
    // if given as a string, initVerb will try to guess the scope (for example "global"=global...)
    "outputscope":"global",
    // the verb name i.e. variable name to be used in the outputscope and/or typescript declarations (shorthand="nm")
    "name":"log",
    // if true, each handler will be added to the outputscope as a sibling to verb using a camelcase pattern (shorthand="sblfy")
    "siblify":true,
    // if true, prototype versions of the functions will be added to all for all core JavaScript classes (except "Object")
    "prototype":true
});

//=====================================================
// mass-initialize multiple global verbs
// this can be used to initialize a lot of potentially required verbs so that you don't ever have to "bother" about verb availability within the rest of the code
var opts={scope:"global","siblify":true,"prototype":true};
var i,names=[
    "create","init","start","stop","on","run","execute","rqr","dfn","exit",
    "get","read","set","write","send","submit","remove","has","is","can",
    "encode","decode","escape","unescape","encrypt","decrypt","hash",
    "convert","to","from"
];
for (i=0;i<names.length;i++) {
    opts.name=names[i];
    initVerb(opts);
}

//=====================================================
console.log("INITIALIZATION OF "+initVerb.verbs.length.toFixed(0)+" VERBS TOOK ~"+(Date.now()-t0)+"MS");

//#####################################################
// add key handler for console logging to log verb
log.on("console",console.log);

//===================================================== 
// run the handler through the verb
log("console","console test");
// directly run the handler from the verb
log.console("direct console test");
// TRY to run a handler through the verb: all verb- and handler-internal exceptions will be suppressed
log.try("console","try console test"); // WORKS
log.try("xyzconsole","try xyzconsole test"); // FAILS SILENTLY, because no handler for "xyzconsole" has been defined

//=====================================================
// as "siblify" has been set to true for the log verb, each handler is also directly available as a sibling to "log" within the output scope ( log+console > logConsole )
logConsole("siblify test");

//=====================================================
// as "prototype" has been set to true for the log verb, each handler is also directly available through the respective prototype functions of the JavaScript core classes
"prototype test".log("console");

//#####################################################
// add uri/scheme handler for console logging
log.on("scheme:c",console.log);

//=====================================================
// run the handler via uri
log("c:console scheme test");
// directly run the handler
log.c("direct console scheme test");

//#####################################################
// add a default log handler which writes unhandleable strings to the console
log.on("type:string",console.log);

//=====================================================
// run the default string handler
log("string type test");
log.string("direct string type test");

//#####################################################
// various patterns can be used to simplify adding handlers without having to explicitely define the handler type

//=====================================================
// if the key is a core javascript type, the handler is of expected to be of type "type"
log.on("number",(n)=>log("custom number logging: "+n));
log(1);

//=====================================================
// if the key is the (lowercase) name  of a core javascript class, the handler is of expected to be of type "instance"
log.on("date",(d)=>log("custom date logging: "+d.toISOString()));
log(new Date());

//=====================================================
// if the key ends with ":", the handler is of expected to be of type "scheme"
log.on("foo:",(s)=>log("FOOOO "+s));
log("foo:testing foo");

//=====================================================
// if the key starts with "$", the handler is of expected to be of type "options"
log.on("$welcome",(o)=>log("Welcome "+o.name+"!"));
log({$:"welcome",name:"Joanna Smith"});

//#####################################################
// add a hello message creator to the str verb using the options handler adder "onoptions(optionstype,...)" instead "on('options:'+optionstype,...)"
str.onoptions("hello",(opts)=>"Hello "+opts.name+", how are you?");

//=====================================================
// log strings created from options object using above handler (directly or through verb)
log(str({
    $:"hello",
    name:"John Smith"
}));
log(str.hello({
    name:"Peter Parker"
}));

//#####################################################
// all handler setting/adding functions ("verb.on*(...)") return the verb itself, i.e. these functions can be used fluently
// all handler setting/adding functions allow defining multiple keys/schemes/types/... at once by providing them in an array
// handler keys/schemes/types/... can be used case-insensitive
// a verb's ".do", ".trydo", ".dotry", ".try.do" and ".do.try" functions return the verb itself, i.e. these functions can be used fluently
log
.on(["UpperCase","uc"],(s)=>console.log(s.toUpperCase()))
.on(["LowerCase","lc"],(s)=>console.log(s.toLowerCase()))
.on(["CamelCase","cc"],(s)=>console.log(s.charAt(0).toUpperCase()+s.substring(1)))
.do("uppercase","uppercase test")
.do("lc","LowerCase TeSt")
.camelcase("camelcase test")

//#####################################################
// adding a verb as a handler allows to introduce subscoping
// in the following example a subscope/subverb "time" will be added to allow logging of times/dates
log.on(["time","t"],initVerb({parent:log})
    .on(["now","current","type:undefined"],()=>log("current time = "+Date.now()))
    .on(["unix","epoch","type:number"],(t)=>log("test unix time = "+new Date(t).getTime()))
    .on("iso",(t)=>log(new Date(t).toISOString()))
    .on("year",(t)=>log("test year = "+(t ? new Date(t) : new Date()).getFullYear()))
)

//=====================================================
// run subverb functionalities in various ways
log("time");
log.time();
log.time(1234567890);
log.time.now();
log("time","year",1234567890);
log("time","year");
log.time.iso(1234567890);
log.time("unix",1234567890);
log("time/iso",1234567890);
log("sync/time/epoch",1234567890);

//#####################################################
// add a user info logger as an arguments-based functions
// an options-based function will automatically be created based on the given typescript descriptions
log.on("UserInfo",(name,age,city)=>console.log("My name is "+name+". I am "+age+" years old and live in "+city+"."),[
    "string","creates a human-readable user info",
    "name:string","the user's full name",
    "age:number","the user's age in years",
    "city:string","the city the user lives in"
]);

//=====================================================
// log strings created from options object using above handler and the auto-generated options handler
log.userinfo("John Smith",32,"Vienna");
log({
    $:"userinfo",
    name:"Jane Doe",
    age:28,
    city:"New York"
});

//#####################################################
// add an object json logger using the key handler adder "onkey(key,...)" instead "on('key:'+key,...)"
log.onkey("json",(o)=>console.log(JSON.stringify(o)));

//=====================================================
log.json({text:"json test"});

//#####################################################
// add an async handler (just as an example - console.log is not actually async :) )
log.async.onkey("console",(x)=>{
    return new Promise((resolve,reject)=>resolve(console.log(x)));
});

//=====================================================
// specifically run sync and async versions of the verb, independent of the verbs "async" definition
log.sync.console("sync console test");
log.async.console("async console test started...").then(()=>log.sync("c:async console test done"));

//#####################################################
// add a default handler for arrays to the log verb
log.ontype("array",(a,sep)=>log(a.join(sep || "\n")));

//=====================================================
// run handler through verb, its sibling and its prototype version
log(["array","type","test"]);
logArray(["array","siblify","test"]," --- ");
["array","prototype","test"].log("/");

//#####################################################
// a verb's "fillIn" function can used to fill a string with the values returned by the verb
// here, the functions used for the filling get defined
str.onscheme("uc",(s)=>s.toUpperCase());
str.onscheme("lc",(s)=>s.toLowerCase());
str.onkey("isotime",(t)=>(t ? new Date(t) : new Date()).toISOString());

//=====================================================
// apply the string filling using previously added handlers
log(str.fillIn('testing string filling with uri: #{uc:uppercase} #{lc:LowerCase}'));
log(str.fillIn('testing string filling with uri string: #{"uc:uppercase"} #{"lc:LowerCase"}'));
log(str.fillIn('testing string filling with options: #{{"$":"hello","name":"Johnny Filler"}}'));
log(str.fillIn('testing string filling with arguments array: #{["isotime",1234567890]}'));

//#####################################################
// a verb's "onbefore" and "onafter" functions can be used to add event handlers that get executed before and/or after each time the "on" handler of the same type gets executed
// the event handler will be called with the exact arguments the verb will get called with
str.on("json",JSON.stringify);
str.onbefore("json",function(s,x){log("i'm about to convert "+JSON.stringify(x)+" into json...");});
str.onbefore("json",function(s,x){log("the json conversion of "+JSON.stringify(x)+" should start any moment...");});
str.onafter("json",function(s,x){log("the json conversion of "+JSON.stringify(x)+" is done.");});

//=====================================================
// run the verb with the given key in order to fire the event handlers
str("json",{foo:"bar"});
// directly running the handler will not fire the event handlers
str.json({morefoo:"morebar"});

//#####################################################
// handlers for custom classes can be added using the "instance:" or "type:" prefix
function MyClass(){
    this.randomvalue=Math.random();
}
log.on("instance:myclass",(x)=>console.log("the random value of this MyClass instance = "+x.randomvalue));

//=====================================================
// create an instance of the custom class, and log it
log(new MyClass());

//#####################################################
// create and log the typescript declarations for the verbs
//log(str.createDts("str")+"\n"+log.createDts("log"));

//#####################################################
// log the total execution time
log.uc("all tests were successful");
log.uc("execution of this script took ~"+(Date.now()-t0).toFixed(0)+"ms");

//#####################################################
//#####################################################
