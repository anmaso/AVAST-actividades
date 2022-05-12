const App = {
  
  
  setup(){
    const Vue = window.Vue;
  
    const dni =  Vue.ref('')
    const id = Vue.ref('')
    const buscando = Vue.ref(false)
    const courses = Vue.ref([])
    const log = Vue.ref('')
    const load = ()=>{
      buscando.value=true
      fetch('/prof/'+id.value+'/'+dni.value).then(r=>r.json()).then(data=>{
        log.value=JSON.stringify(data,null,2)
        courses.value=data;
        buscando.value=false;
      }).catch(e=>{
        log.value=e
      })
    }
    
    return {
      dni,
      id,
      log,
      load,
      courses,
      buscando
    }
  }
}
const app=window.Vue.createApp(App)

app.directive('focus', {
  // When the bound element is mounted into the DOM...
  mounted(el) {
    // Focus the element
    el.focus()
  }
});

app.mount("#vue");