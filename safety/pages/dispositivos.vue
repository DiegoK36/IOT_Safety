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
 
        <el-table :data="devices">
          
          <el-table-column label="ola" min-width="50" align="center">
            <div slot-scope="{ row, $index }">
              {{ $index + 1 }}
            </div>
          </el-table-column>

          <el-table-column prop="name" label="Nombre" align="center"></el-table-column>

          <el-table-column prop="dId" label="ID Dispositivo" align="center"></el-table-column>

          <el-table-column prop="templateId" label="ID de Plantilla" align="center"></el-table-column>

          <el-table-column prop="templateName" label="Plantilla" align="center"></el-table-column>

          <el-table-column label="Eliminar" align="center">

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

    <pre> {{ devices }}</pre>

  </div>
</template>

<script>
import { Table, TableColumn } from "element-ui";
import { Select, Option } from "element-ui";
import BaseSwitch from '../components/BaseSwitch.vue';

export default {
  components: {
    BaseSwitch,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select
  },

  data() {
    return {
      devices: [
      {
        name: "Oficina C",
        dId: "12",
        templateName: "Sensor de Gas",
        templateId: "1",
        guardar: true
      },
      {
        name: "Sala de Reuniones",
        dId: "3",
        templateName: "Temperatura y Humedad",
        templateId: "3",
        guardar: false
      },
      {
        name: "Despacho A",
        dId: "5",
        templateName: "Sensor de Luz",
        templateId: "2",
        guardar: true
      }
      ]
    };
  },
  methods: {
    
    deleteDevice(device){
      alert("Borrando " + device.name + "...");
    },

    saveRule(index){
      this.devices[index].guardar = !this.devices[index].guardar;
    }
  }
};
</script>