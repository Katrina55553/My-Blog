---
title: Vue 基本语法
date: 2026-01-20
tags: [前端, Vue]
description: Vue 基础语法详解，涵盖文本插值、动态绑定、条件渲染、列表渲染、事件绑定、双向数据绑定、计算属性与监听器。
---

### 文本插值

`{{ 变量/表达式 }}` （支持算术运算、三元判断等简单逻辑）

```vue
<script setup lang="ts">
const name = "Katrina"
const age = 18
const gender = true
const list = [1, 2, 3]
const obj = { name: name }
</script>


<template>
    <div>
        <div>name: {{ name }}</div>
        <div>age: {{ age }}</div>
        <div>gender: {{ gender ? "男" : "女" }}</div>
        <div>list: {{ list }}</div>
        <div>obj : {{ obj }}</div>
        <div>obj.name: {{ obj.name }}</div>
    </div>
</template>
```



### 动态绑定

`v-bind` （简写 `:`，绑定属性/样式/类名）

```vue
<script setup lang="ts">
const name = "Katrina"
const className = "active"
const classObj = {
    menu: true,
    active: true
}
const styleObj = {
    fontSize: "20px",
    color: "blue"
}
</script>


<template>
    <div>
        <div v-bind:name="name">动态绑定name</div>
        <div v-bind:class="className">动态绑定className</div>
        <div :class="classObj">动态绑定classObj</div>
        <div :style="styleObj">动态绑定styleObj</div>
    </div>
</template>
```



### v-text 和 v-html

`v-text` 纯文本渲染

将数据以纯文本的形式渲染到元素内部，等价于使用`{{ }}`插值表达式（但优先级更
高，会覆盖插值内容)。它会把所有内容都当作普通文本处理，不会解析HTML标签。


`v-html` HTML解析渲染

将数据中的HTML字符串解析成真实的HTML元素并渲染到页面，相当于原生JS的
innerHTML属性。
`v-html`会直接解析并执行HTML中的脚本、样式等，绝对不能用在用户输入的内容上（比如评论、用户名)，否则可能导致XSS攻击（比如用户输入<script>窃取用户信息</script>)


```vue
<script setup lang="ts">
const meg = "Katrina"
const html = `<span style="color: #00bd7e" >Hello</span>`
</script>


<template>
    <div>
        <div>{{ meg }}</div>
        <div>{{ meg + "xxx" }}</div>

        <div v-text="meg"></div>
        <!-- v-text会覆盖元素内的所有内容 -->
        <div v-text="meg">
            这里的文字会被覆盖掉！
        </div>
        <div v-text="meg + 'xxx'"></div>

        <div v-html="html"></div>
    </div>
</template>
```


| 方式       | 作用     | 是否解析HTML | 安全性   | 使用场景             |
| -------- | ------ | -------- | ----- | ---------------- |
| `{{ }}`  | 插值表达式  | ❌ 不解析    | ✅ 安全  | 90%的情况都用这个       |
| `v-text` | 文本指令   | ❌ 不解析    | ✅ 安全  | 很少用，基本被 {{ }} 替代 |
| `v-html` | HTML指令 | ✅ 解析HTML | ⚠️ 危险 | 显示富文本内容（要确保内容安全） |


### 条件渲染

`v-if/v-else`（DOM 增删）、`v-show`（CSS 显示隐藏）


```vue
<script setup lang="ts">
const gender = true
const age = 22
</script>


<template>
    <div>
        <span v-if="age >= 35"> 被优化 </span>
        <span v-else-if="age >= 18">已成年</span>
        <span v-else>未成年</span>
    </div>
    <div>
        <span v-show="gender">男</span>
        <span v-show="!gender">女</span>
    </div>
</template>
```

记住这两个简单的规则：

1. **问：这个元素需要频繁显示/隐藏吗？**
    - 频繁 → **v-show**
    - 不频繁 → **v-if**

2. **问：初始条件可能为假吗？**
    - 通常为假，很少显示 → **v-if**（节省初始渲染）
    - 通常显示，偶尔隐藏 → **v-show**


### 列表渲染

`v-for`（遍历数组 / 对象，`key`属性的必要性）

```vue
<script setup lang="ts">
const array = [
    "KKK", "JJJ", "LLL", "abc"
]

const obj = {
    name: "KKK",
    age: 21,
    addr: "China"
}
</script>


<template>
    <div>
        <ul>
            <li v-for="item in array">{{ item }}</li>
        </ul>
        <ul>
            <li v-for="(item, index) in array">{{ index }}.{{ item }}</li>
        </ul>

        <ul>
            <li v-for="item in obj">{{ item }}</li>
        </ul>
        <ul>
            <li v-for="(value, key) in obj">{{ key }}: {{ value }}</li>
        </ul>
        <ul>
            <li v-for="(value, key, index) in obj">{{ index }}.{{ key }}: {{ value }}</li>
        </ul>
    </div>
</template>
```



### 事件绑定

`v-on`（简写`@`，绑定点击 / 输入等事件）

```vue
<script setup lang="ts">
function clickHandler(e: Event) {
    console.log("点击事件", e)
}
function clickHandler1(name: string, e: Event) {
    console.log("点击事件", name, e)
}
function alertHandler(msg: string) {
    alert(msg)
}
function enterHandler(e: KeyboardEvent) {
    const target = e.target as HTMLInputElement
    const value = target.value
    console.log("enter键按下了", value)
}
function inputHandler(e: InputEvent) {
    console.log("键盘输入中", e.data)
}
function focusHandler() {
    console.log("触发焦点了")
}
function blurHandler() {
    console.log("失去焦点了")
}

</script>


<template>
    <div>
        <div>点击事件 <button v-on:click="clickHandler">点我</button></div>
        <div>点击事件 <button @click="clickHandler">点我</button></div>
        <div>点击事件 <button @click="clickHandler1('Katrina', $event)">点我</button></div>

        <div>双击事件 <button @dblclick="alertHandler('双击')">双击事件</button></div>
        <div>右键 <button @click.right="alertHandler('右键')">右键</button></div>
        <div>中键 <button @click.middle="alertHandler('中键')"></button> </div>

        <div>enter键 <input @keydown.enter="enterHandler" placeholder="enter键"></div>
        <div>input输入 <input @input="inputHandler" placeholder="input输入"></div>
        <div>input触发焦点 <input @focus="focusHandler" placeholder="input触发焦点"></div>
        <div>input失去焦点 <input @blur="blurHandler" placeholder="input失去焦点"></div>
    </div>
</template>
```


### 事件处理与修饰符

##### .prevent

比如a标签点击默认会跳转，可以使用.prevent阻止默认的跳转

```vue
<script setup lang="ts">
function clickHandler(e: Event) {
    console.log(e.target)
    console.log("阻止了默认跳转行为")
}
</script>


<template>
    <div>
        <a href="https://codeforces.com/" @click.prevent="clickHandler">Codeforces</a>
    </div>
</template>
```


##### .once

事件只触发一次

```vue
<script setup lang="ts">
function clickHandler(e: Event) {
    console.log(e.target)
    console.log("这个函数只会执行一次！")
}
</script>


<template>
    <div>
        <button @click.once="clickHandler">只有第一次点击才有效</button>
    </div>
</template>
```


**事件冒泡** ： 当内部的button按钮点击之后，会将点击事件向上传递

![Vue-基本语法-事件冒泡.png](/images/vue-.png)


```vue
<script setup lang="ts">
function clickHandler(e: Event, name: string){
  console.log(e.target, name)
}

</script>

<template>
  <div>
    事件冒泡
    <div class="A" @click="clickHandler($event, 'A')">
      A
      <div class="B" @click="clickHandler($event, 'B')">
        B
        <button @click="clickHandler($event, 'Button')">button</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.A {
  background-color: #ee4a4a;
  padding: 20px;
}

.B {
  background-color: #10d291;
  padding: 20px;
}
</style>
```


**.stop**

可以使用事件修饰符 .stop 阻止事件冒泡

这样，点击button，就只有button的点击事件触发了


#### .self

作用是仅当事件触发源是当前元素自身时，才执行事件处理函数

比如，给B绑定了.self，那么点击button的时候，由于事件冒泡，本来B是要收到事件的，但是因为.self的存在，把它给过滤了，然后A收到事件冒泡，没有.self，所以它收到了事件冒泡

点击B的时候，.self本身是不会阻止事件冒泡的，所以A也会收到事件



事件修饰符是可以连用的，但是这个顺序是有讲究的，以B为例

```vue
<div class="A" @click="clickHandler($event, 'A')">
  A
  <div class="B" @click.stop.self="clickHandler($event, 'B')">
    B
    <button @click="clickHandler($event, 'Button')">button</button>
  </div>
</div>
```

1. `@click.stop.self`：点击 button → 事件冒泡到 B → `.stop` 先触发（阻断冒泡到 A）→ 再判断`.self`（触发源是 button≠B，所以 B 的事件不执行）→ 最终：A 无响应，B 无响应，只有 button 自己执行。
2. `@click.self.stop`：点击 button → 事件冒泡到 B → 先判断`.self`（触发源是 button ≠ B，B 的事件直接不执行）→ `.stop` 因 “事件未执行” 也不会触发 → 事件继续冒泡到 A → 最终：button 执行，B 无响应，A 执行。


### 事件委托






### 双向数据绑定


```vue
<script setup lang="ts">
import { ref } from "vue";

const msg = ref("")
</script>


<template>
    <div>
        <div>
            <input v-model="msg" placeholder="请输入内容">
        </div>
        <div>
            输入的内容为 {{ msg }}
        </div>
    </div>
</template>

<style scoped></style>
```

这里引入了 ref 和 v-model

- `ref("")`：创建一个响应式数据容器（存储 msg 的值），保证数据变化时视图自动更新 ；
- `v-model="msg"`：把这个响应式数据和输入框做双向绑定，实现「用户输入 → msg 自动更新」「msg 手动修改 → 输入框内容自动更新」。

很多输入组件都可以使用 v-model

```vue
<script setup lang="ts">
import { reactive } from "vue";

const data = reactive({
    name: "",
    age: 18,
    gender: true,
    like: []
})
</script>


<template>
    <div>
        <div>
            <input v-model="data.name" placeholder="请输入姓名">
            <br>
            <input v-model="data.age" type="number" placeholder="请输入年龄">
            <br>
            选择性别
            <input type="radio" v-model="data.gender" :value="true"> 男
            <input type="radio" v-model="data.gender" :value="false"> 女
            <br>
            选择爱好
            <input type="checkbox" v-model="data.like" value="1"> 1
            <input type="checkbox" v-model="data.like" value="2"> 2
            <input type="checkbox" v-model="data.like" value="3"> 3
            <input type="checkbox" v-model="data.like" value="4"> 4
        </div>
        <div>
            输入的内容为 {{ data }}
        </div>
    </div>
</template>
```

这里引入了reactive，一般用 reactive 给对象设置响应式


v-model 本质是语法糖

```vue
<script setup lang="ts">
import {ref} from "vue";

const msg = ref("");

// 手动监听输入事件，更新 msg
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  msg.value = target.value;
};
</script>

<template>
  <div>
    手动实现双向绑定
    <div>
      <!-- 等价于 v-model：value 绑定 + input 事件监听 -->
      <input :value="msg" @input="handleInput" placeholder="输入内容">
    </div>
    <div>
      输入的内容 {{ msg }}
    </div>
  </div>
</template>
```


### 计算属性

模板语法痛点：模板中允许写简单表达式（如 `{{ a + b }}`），但会导致模板臃肿、可读性差
计算属性 —— 专门封装「基于响应式数据派生的逻辑」，让模板回归 “展示” 本质。

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
const list = ref([{ done: true }, { done: false }, { done: true }])

const doneCount = computed(() => {
    console.log("doneCount")
    return list.value.filter((item) => item.done).length
})

function doneCount2() {
    console.log("doneCount2")
    return list.value.filter((item) => item.done).length
}
</script>


<template>
    <div>
        任务完成数量: {{list.filter((item) => item.done).length}}
        <br>
        任务完成数量（计算属性）: {{ doneCount }}
    </div>
</template>
```


计算属性核心特性：**缓存**—— 只有依赖的响应式数据（如 `list.value`）变化时，计算属性才会重新计算，否则复用上次结果（对比 methods 无缓存）。

##### 带参数的计算属性

通过返回函数的方式就好了，但是这种方式会失去计算属性缓存的功能

```vue
<script setup lang="ts">
import { computed } from "vue";

const menuList = [
    { name: "首页" },
    { name: "新闻" }
]

const menu = computed(() => {
    return (idx: number) => {
        return menuList[idx].name
    }
})
</script>


<template>
    <div>
        菜单1（计算属性带参数） {{ menu(0) }}
        <br>
        菜单2（计算属性带参数） {{ menu(1) }}
    </div>
</template>
```

##### 可写的计算属性





### 监听器

- 基本语法：`watch(监听目标, (新值, 旧值) => { 执行逻辑 }, 配置项)`；
- 清理函数：返回一个函数，会在「下一次回调执行前 / 监听器停止时」执行，用于清理定时器、取消请求等（解决异步竞态问题）；
- 触发时机：只有监听目标变化时才执行（首次渲染不执行，可通过配置项修改）。

```vue
<script setup>
import { ref, watch, reactive } from "vue";

// 监听 msg 变化：参数1=监听目标，参数2=回调函数（新值、旧值）
const msg = ref("")
watch(msg, (newValue, oldValue) => {
    console.log("从", oldValue, "变成", newValue)
})

// 监听多个目标：数组形式
const name = ref(""), age = ref(18)
watch([name, age], (newValue, oldValue) => {
    console.log(oldValue, "->", newValue)
})

// 监听 reactive 对象：默认深度监听（无需配置 deep: true）
const user = reactive({
    name: 'katrina',
    info: { age: 18 }
})
watch(user, (newVal) => {
    console.log('user 任意属性变化', newVal)
})

// 监听 reactive 对象的单个属性（需用函数返回）
watch(() => user.info.age, (newAge, oldAge) => {
    console.log('age 变化', oldAge, '->', newAge)
})
</script>
```

##### watch 核心配置项

| 配置项       | 作用                      | 适用场景                   |
| --------- | ----------------------- | ---------------------- |
| immediate | 首次渲染立即执行回调              | 初始化时就执行监听逻辑（如默认加载数据）   |
| deep      | 深度监听对象 / 数组的嵌套属性变化      | 监听 ref ({})、ref ([]) 时 |
| flush     | 回调执行时机：pre（默认）/post/ 同步 | post = 需要操作更新后的 DOM    |

##### watchEffect 隐式监听

`watchEffect` 是「隐式监听」—— 无需指定监听目标，自动收集回调中用到的响应式数据作为依赖，代码更简洁，但可读性稍弱。

```js
const we = ref("")
watchEffect(()=>{
  console.log("we:", we.value)
})
```



