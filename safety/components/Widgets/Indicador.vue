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
    props: ['config'],
    data() {
        return {
            value: true,
        };
    },

    mounted() {
        const topic = this.config.userID + "/" + this.config.selectedDevice.dID + "/" + this.config.variable + "/sdata";
        this.$nuxt.$on(topic, this.proccessData);
    },

    beforeDestroy() {
        const topic = this.config.userID + "/" + this.config.selectedDevice.dID + "/" + this.config.variable + "/sdata";
        this.$nuxt.$off(topic);
    },

    methods: {

        proccessData(data){

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
