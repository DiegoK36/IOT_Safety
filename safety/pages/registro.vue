<template>
  <div class="container login-page">
    <div class="col-lg-4 col-md-6 ml-auto mr-auto">
      <card class="card-login card-white">
        <template slot="header">
          <img src="../static/iot.png" alt="" />
          <h1 class="card-title">Safety IOT</h1>
        </template>

        <div>
          <base-input
            name="name"
            v-model="usuario.name"
            placeholder="Nombre"
            addon-left-icon="tim-icons icon-badge"
          >
          </base-input>

          <base-input
            name="email"
            v-model="usuario.email"
            placeholder="Correo"
            addon-left-icon="tim-icons icon-email-85"
          >
          </base-input>

          <base-input
            name="password"
            v-model="usuario.passwd"
            type="password"
            placeholder="Contraseña"
            addon-left-icon="tim-icons icon-lock-circle"
          >
          </base-input>
        </div>

        <div slot="footer">
          <base-button
            native-type="submit"
            type="primary"
            class="mb-3"
            size="lg"
            @click="registro()"
            block
          >
            Registrarse
          </base-button>

          <div class="pull-left">
            <h6>
              <nuxt-link class="link footer-link" to="/login">
                Iniciar Sesión
              </nuxt-link>
            </h6>
          </div>

          <div class="pull-right">
            <h6><a href="#help!!!" class="link footer-link">Ayuda</a></h6>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>
<script>
export default {
  middleware: "noIdentificado",
  layout: "auth",
  data() {
    return {
      usuario: {
        name: "",
        email: "",
        passwd: ""
      }
    };
  },
  methods: {
    registro() {
      this.$axios
        .post("/registro", this.usuario)
        .then(res => {
          //Éxito - Usuario creado.
          if (res.data.status == "Éxito") {
            this.$notify({
              type:"success",
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Éxito! Ya puede iniciar sesión"
            });
            this.usuario.name = "";
            this.usuario.passwd = "";
            this.usuario.email = "";
            return;
          }
        })
        .catch(e => {
          console.log(e.response.data);
          if (e.response.data.error.errors.email.kind == "unique") {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "Este usuario ya existe"
            });
            return;
          } else {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "Error al crear el usuario"
            });
            return;
          }
        });
    }
  }
};
</script>
<style>
.navbar-nav .nav-item p {
  line-height: inherit;
  margin-left: 5px;
}
</style>
