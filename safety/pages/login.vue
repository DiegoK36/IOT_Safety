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
              @click="login()"
              block
            >
              Iniciar Sesión
            </base-button>
            <div class="pull-left">
              <h6>
                <nuxt-link class="link footer-link" to="/registro">
                  Crear una Cuenta
                </nuxt-link>
              </h6>
            </div>
  
            <div class="pull-right">
              <h6><a href="#Ayuda" class="link footer-link">Ayuda</a></h6>
            </div>
          </div>
        </card>
      </div>
    </div>
  </template>
  
  <script>
  const Cookie = process.client ? require("js-cookie") : undefined;
  export default {
    middleware: "noIdentificado",
    layout: "auth",
    data() {
      return {
        usuario: {
          email: "",
          passwd: ""
        }
      };
    },
    mounted() {
    },
    methods: {
      login() {
        this.$axios
          .post("/login", this.usuario)
          .then(res => {
            // Éxito - Sesión Iniciada.
            if (res.data.status == "Éxito") {
              this.$notify({
                type: "success",
                type: "success",
                icon: "tim-icons icon-check-2",
                message: "Bienvenido de nuevo " + res.data.userData.name + " !"
              });
              
              const auth = {
                token: res.data.token,
                userData: res.data.userData
              }

              // Token a la tienda
              this.$store.commit('setAuth', auth);
              // Grabamos el token en LocalStorage
              localStorage.setItem('auth', JSON.stringify(auth));
              $nuxt.$router.push('/dashboard');
              return;
            }
          })
          .catch(e => {
            console.log(e.response.data);

              this.$notify({
                type: "danger",
                icon: "tim-icons icon-alert-circle-exc",
                message: "Error - Credenciales Inválidas"
              });
              return;
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