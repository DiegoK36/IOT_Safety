<template>
    <card>
        
        <div slot="header">
          <h4 class="card-title"> {{ config.selectedDevice.name }} - {{ config.FullName }} </h4>
        </div>

        <i class="fa " :class="[config.icon, getColor()]" style="font-size: 40px"></i>

    </card>
</template>

<script>
export default {
    //props: ['config']
    data() {
        return {
            value: true,
            config: {
                userID:'userid',
                selectedDevice: {
                    name: "Despacho A",
                    dId: "5",
                    templateName: "Sensor de Luz",
                    templateId: "2",
                    guardar: true,
                },
                FullName: "Sensor de Luz",
                variable: "unicoSTR",
                icon: "fa-sun",
                column: "col-6",
                widget: "indicador",
                class: "success"
            }
        };
    },

    mounted() {
        this.$nuxt.$on('Luztopic', this.proccessData);
    },

    methods: {

        proccessData(data){
            console.log('Recibido');
            console.log(data);
            this.value = data.value;

        },

        getColor(){
            
            if(!this.value){
                return "text-dark";
            }

            if(this.config.class == "success"){
                return "text-success";
            }

            if(this.config.class == "primary"){
                return "text-primary";
            }

            if(this.config.class == "warning"){
                return "text-warning";
            }

            if(this.config.class == "danger"){
                return "text-danger";
            }
        }
    }
}
</script>
