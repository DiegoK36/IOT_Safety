<template>

    <div class="row" v-if="$store.state.devices.length > 0">
  
      <div
        v-for="(widget, index) in $store.state.selectedDevice.template.widgets"
        :key="index"
        :class="[widget.column]"
      >
  
        <Grafico
          v-if="widget.widget == 'grafico'"
          :config="fixWidget(widget)"
        ></Grafico>
  
        <SwitchSafe
          v-if="widget.widget == 'switch'"
          :config="fixWidget(widget)"
        ></SwitchSafe>
  
        <Boton
          v-if="widget.widget == 'boton'"
          :config="fixWidget(widget)"
        ></Boton>
  
        <Indicador
          v-if="widget.widget == 'indicador'"
          :config="fixWidget(widget)"
        ></Indicador>
      </div>
    </div>
  
    <div v-else class="card-title">
      ADVERTENCIA: Debes seleccionar un Dispositivo para acceder al Dashboard
    </div>
  
  </template>
  <script>
import Indicador from "../components/Widgets/Indicador.vue";
import Boton from "../components/Widgets/Boton.vue";
import Grafico from "../components/Widgets/Grafico.vue";
import SwitchSafe from "../components/Widgets/SwitchSafe.vue";

export default {
  components: {     
    Indicador,
    Boton,
    Grafico,
    SwitchSafe },
    middleware: "Identificado",
    name: 'Dashboard',
  data() {
    return {
    } 
  },
  mounted() {
  
  },
  methods: {
    fixWidget(widget){
      var widgetCopy = JSON.parse(JSON.stringify(widget));
      widgetCopy.selectedDevice.dId = this.$store.state.selectedDevice.dId;
      widgetCopy.selectedDevice.name = this.$store.state.selectedDevice.name;
      widgetCopy.userId = this.$store.state.selectedDevice.userId;
      if (widget.widget =="grafico"){
        widgetCopy.demo = false;
      }
      
      return widgetCopy;
    }
  }
};
</script>