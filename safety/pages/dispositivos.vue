<template>
  <div>
    <!-- Añadir un Dispositivo -->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">Añadir Nuevo Dispositivo</h4>
        </div>

        <div class="row">

          <div class="col-4">
            <base-input
              label="Nombre del Dispositivo"
              type="text"
              placeholder="Ingresa un Nombre"
            >
            </base-input>
          </div>

          <div class="col-4">
            <base-input
              label="ID del Dispositivo"
              type="text"
              placeholder="Ingresa el ID"
            >
            </base-input>
          </div>

          <div class="col-4">
            <slot name="label">
              <label> Plantilla </label>
            </slot>

            <el-select
              placeholder="Selecciona una Plantilla"
              class="select-primary"
              style="width:100%"
            >
              <el-option
                class="text-dark"
                value="P1"
                label="Plantilla 1"
              >
              </el-option>

              <el-option
                class="text-dark"
                value="P2"
                label="Plantilla 2"
              >
              </el-option>

              <el-option
                class="text-dark"
                value="P3"
                label="Plantilla 3"
              >
              </el-option>

            </el-select>
          </div>
        </div>

        <div class="row pull-right">
          <div class="col-12">
            <base-button
              type="primary"
              class="mb-3"
              size="lg"
              >Añadir</base-button
            >
          </div>
        </div>

      </card>
    </div>

    <!-- Tabla de Dispositivos -->
    <div class="row">
      <card>

        <div slot="header">
          <h4 class="card-title">Dispositivos</h4>
        </div>
 
        <el-table :data="$store.state.devices">
          
          <el-table-column header="#" prop="$" label="#" min-width="50" align="center">
            <div slot-scope="{ row, $index }">
              {{ $index + 1 }}
            </div>
          </el-table-column>

          <el-table-column header="name" prop="name" label="Nombre" align="center"></el-table-column>

          <el-table-column header="ID" prop="dId" label="ID Dispositivo" align="center"></el-table-column>

          <el-table-column header="ID2" prop="templateId" label="ID de Plantilla" align="center"></el-table-column>

          <el-table-column header="name2" prop="templateName" label="Plantilla" align="center"></el-table-column>

          <el-table-column header="Delete" prop="Eliminate" label="Eliminar" align="center">

            <div slot-scope="{ row, $index }">

              <el-tooltip content="Indicador DB" effect="light" style="margin-right:6px">
                <i class="fas fa-database" :class="{'text-success' : row.guardar, 'text-danger' : !row.guardar}"></i>
              </el-tooltip>

              <el-tooltip content="Guardar Database" effect="light">
                <base-switch 
                  type="blue" 
                  @click="saveRule($index)" 
                  :value="row.guardar" 
                  on-text="On" 
                  off-text="Off"
                >
                </base-switch>
              </el-tooltip>

              <el-tooltip
                content="Eliminar"
                effect="light"
                :open-delay="300"
                placement="top"
              >

                <base-button 
                  type="danger" 
                  icon size="sm" 
                  class="btn-link"
                  @click="deleteDevice(row)"
                >
                  <i class="tim-icons icon-simple-remove"></i>
                </base-button>

              </el-tooltip>

            </div>
          </el-table-column>

        </el-table>
      </card>
    </div>

    <Json :value="$store.state.devices"></Json>

  </div>
</template>

<script>
import { Table, TableColumn } from "element-ui";
import { Select, Option } from "element-ui";
import BaseSwitch from '../components/BaseSwitch.vue';
import Json from '../components/Json.vue';

export default {
  middleware: "Identificado",
  components: {
    BaseSwitch,
    Json,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select
  },

  data() {
    return {
    };
  },
  mounted(){
    this.$store.dispatch('getDevices');
  },
  methods: {

    deleteDevice(device) {
      const axiosHeader = {
        headers: {
          token: this.$store.state.auth.token
        },
        params: {
          dId: device.dId
        }
      };
      this.$axios
        .delete("/dispositivos", axiosHeader)
        .then(res => {
          if (res.data.status == "Éxito") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: device.name + " ha sido eliminado"
            });
            this.$store.dispatch("getDevices");
          }
        })
        .catch(e => {
          console.log(e);
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Error al eliminar " + device.name
          });
        });
    }
  }
};
</script>