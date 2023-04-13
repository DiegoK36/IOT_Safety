<template>
    <card>
        
        <div slot="header">
          <h4 class="card-title"> {{ config.selectedDevice.name }} - {{ config.FullName }} </h4>
        </div>

        <base-button
            type="primary"
            class="mb-3 pull-right"
            size="lg"
            @click="sendValue()"
            >Añadir
        </base-button >

        <i class="fa " :class="[config.icon, getColor()]" style="font-size: 40px"></i>

    </card>
</template>

<script>
export default {
    props: ['config'],
    data() {
        return {
            sending: false,
        };
    },

    mounted() {
        
    },

    methods: {

        sendValue() {
            this.sending = true;

            setTimeout(()=> {
                this.sending = false;
            }, 500);

            const toSend = {
                topic: this.config.userID + "/" + this.config.selectedDevice.dID + "/" + this.config.variable + "/actdata",
                msg: {
                    value: this.config.message
                }
            };

            console.log(toSend);
            this.$nuxt.$emit('mqtt-sender', toSend);

        },

        getColor() {
            
            if(!this.sending){
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
