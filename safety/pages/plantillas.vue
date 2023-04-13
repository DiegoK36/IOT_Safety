<template>
    <div>
        <!-- Configuración de Widgets -->
        <div class="row">
            <card>
                <div slot="header">
                    <h4 class="card-title">Añadir un Widget</h4>
                </div>

                <div class="row">

                    <!-- Selector y Formulario -->
                    <div class="col-6">

                        <!-- Selector de Widgets -->
                        <el-select
                            v-model="widgetType"
                            class="select-success"
                            placeholder="Selecciona un Widget"
                            style="width: 100%;"
                        >
                            <el-option
                                class="text-dark"
                                value="grafico"
                                label="Gráfico de Valores"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="indicador"
                                label="Indicator de Entrada"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="switch"
                                label="Switch de Salida"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="boton"
                                label="Botón de Salida"
                            >
                            </el-option>
                        </el-select>

                        <br />
                        <br />

                        <!-- Formulario Gráfico -->
                        <div v-if="widgetType == 'grafico'">
                        <base-input
                            v-model="ncConfig.variableFullName"
                            label="Var Name"
                            type="text"
                        >
                        </base-input>

                        <base-input v-model="ncConfig.unit" label="Unit" type="text">
                        </base-input>

                        <base-input
                            v-model.number="ncConfig.decimalPlaces"
                            label="Decimal Places"
                            type="number"
                        >
                        </base-input>

                        <base-input
                            v-model="ncConfig.icon"
                            label="Icon"
                            type="text"
                        >
                        </base-input>

                        <br />

                        <base-input
                            v-model.number="ncConfig.variableSendFreq"
                            label="Send Freq"
                            type="number"
                        >
                        </base-input>

                        <br />

                        <base-input
                            v-model.number="ncConfig.chartTimeAgo"
                            label="Chart Back Time (mins)"
                            type="number"
                        >
                        </base-input>

                        <br />

                        <el-select
                            v-model="ncConfig.class"
                            class="select-success"
                            placeholder="Select Class"
                            style="width: 100%;"
                        >
                            <el-option
                                class="text-success"
                                value="success"
                                label="Success"
                            >
                            </el-option>
                            <el-option
                                class="text-primary"
                                value="primary"
                                label="Primary"
                            >
                            </el-option>
                            <el-option
                                class="text-warning"
                                value="warning"
                                label="Warning"
                            >
                            </el-option>
                            <el-option
                                class="text-danger"
                                value="danger"
                                label="Danger"
                            >
                            </el-option>
                        </el-select>

                    <br /><br /><br />

                        <el-select
                            v-model="ncConfig.column"
                            class="select-success"
                            placeholder="Select Column Width"
                            style="width: 100%;"
                        >
                            <el-option
                                class="text-dark"
                                value="col-3"
                                label="col-3"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-4"
                                label="col-4"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-5"
                                label="col-5"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-6"
                                label="col-6"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-7"
                                label="col-7"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-8"
                                label="col-8"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-9"
                                label="col-9"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-10"
                                label="col-10"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-11"
                                label="col-11"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-12"
                                label="col-12"
                            >
                            </el-option>
                        </el-select>

                    <br /><br />
            
                        </div>

                        <!-- Formulario Switch -->
                        <div v-if="widgetType == 'switch'">
                        <base-input
                            v-model="iotSwitchConfig.variableFullName"
                            label="Var Name"
                            type="text"
                        >
                        </base-input>

                        <base-input
                            v-model="iotSwitchConfig.icon"
                            label="Icon"
                            type="text"
                        >
                        </base-input>

                        <br />

                        <el-select
                            v-model="iotSwitchConfig.class"
                            class="select-success"
                            placeholder="Select Class"
                            style="width: 100%;"
                        >
                            <el-option
                                class="text-success"
                                value="success"
                                label="Success"
                            >
                            </el-option>
                            <el-option
                                class="text-primary"
                                value="primary"
                                label="Primary"
                            >
                            </el-option>
                            <el-option
                                class="text-warning"
                                value="warning"
                                label="Warning"
                            >
                            </el-option>
                            <el-option
                                class="text-danger"
                                value="danger"
                                label="Danger"
                            >
                            </el-option>
                        </el-select>

                    <br /><br /><br />

                        <el-select
                            v-model="iotSwitchConfig.column"
                            class="select-success"
                            placeholder="Select Column Width"
                            style="width: 100%;"
                        >
                            <el-option
                                class="text-dark"
                                value="col-3"
                                label="col-3"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-4"
                                label="col-4"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-5"
                                label="col-5"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-6"
                                label="col-6"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-7"
                                label="col-7"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-8"
                                label="col-8"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-9"
                                label="col-9"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-10"
                                label="col-10"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-11"
                                label="col-11"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-12"
                                label="col-12"
                            >
                            </el-option>
                        </el-select>

                    <br /><br />

                        </div>

                        <!-- Formulario Botón -->
                        <div v-if="widgetType == 'boton'">
                        <base-input
                            v-model="configButton.variableFullName"
                            label="Var Name"
                            type="text"
                        >
                        </base-input>

                        <base-input
                            v-model="configButton.message"
                            label="Message to send"
                            type="text"
                        >
                        </base-input>

                        <base-input
                            v-model="configButton.text"
                            label="Button Text"
                            type="text"
                        >
                        </base-input>

                        <base-input
                            v-model="configButton.icon"
                            label="Icon"
                            type="text"
                        >
                        </base-input>

                    <br />

                        <el-select
                            v-model="configButton.class"
                            class="select-success"
                            placeholder="Select Class"
                            style="width: 100%;"
                        >
                            <el-option
                                class="text-success"
                                value="success"
                                label="Success"
                            >
                            </el-option>
                            <el-option
                                class="text-primary"
                                value="primary"
                                label="Primary"
                            >
                            </el-option>
                            <el-option
                                class="text-warning"
                                value="warning"
                                label="Warning"
                            >
                            </el-option>
                            <el-option
                                class="text-danger"
                                value="danger"
                                label="Danger"
                            >
                            </el-option>
                        </el-select>

                    <br /><br /><br />

                        <el-select
                            v-model="configButton.column"
                            class="select-success"
                            placeholder="Select Column Width"
                            style="width: 100%;"
                        >
                            <el-option
                                class="text-dark"
                                value="col-3"
                                label="col-3"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-4"
                                label="col-4"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-5"
                                label="col-5"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-6"
                                label="col-6"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-7"
                                label="col-7"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-8"
                                label="col-8"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-9"
                                label="col-9"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-10"
                                label="col-10"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-11"
                                label="col-11"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-12"
                                label="col-12"
                            >
                            </el-option>
                        </el-select>

                    <br /><br />
                        </div>

                        <!-- Formulario Indicador -->
                        <div v-if="widgetType == 'indicador'">

                        <base-input
                            v-model="iotIndicatorConfig.variableFullName"
                            label="Var Name"
                            type="text"
                        >
                        </base-input>

                        <base-input
                            v-model="iotIndicatorConfig.icon"
                            label="Icon"
                            type="text"
                        >
                        </base-input>

                    <br />

                        <base-input
                            v-model="iotIndicatorConfig.variableSendFreq"
                            label="Send Freq"
                            type="text"
                        >
                        </base-input>

                    <br />

                        <el-select
                            v-model="iotIndicatorConfig.class"
                            class="select-success"
                            placeholder="Select Class"
                            style="width: 100%;"
                        >
                            <el-option
                                class="text-success"
                                value="success"
                                label="Success"
                            >
                            </el-option>
                            <el-option
                                class="text-primary"
                                value="primary"
                                label="Primary"
                            >
                            </el-option>
                            <el-option
                                class="text-warning"
                                value="warning"
                                label="Warning"
                            >
                            </el-option>
                            <el-option
                                class="text-danger"
                                value="danger"
                                label="Danger"
                            >
                            </el-option>
                        </el-select>

                    <br /><br /><br />

                        <el-select
                            v-model="iotIndicatorConfig.column"
                            class="select-success"
                            placeholder="Select Column Width"
                            style="width: 100%;"
                        >
                            <el-option
                                class="text-dark"
                                value="col-3"
                                label="col-3"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-4"
                                label="col-4"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-5"
                                label="col-5"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-6"
                                label="col-6"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-7"
                                label="col-7"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-8"
                                label="col-8"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-9"
                                label="col-9"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-10"
                                label="col-10"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-11"
                                label="col-11"
                            >
                            </el-option>
                            <el-option
                                class="text-dark"
                                value="col-12"
                                label="col-12"
                            >
                            </el-option>
                        </el-select>

                    <br /><br />
                        </div>

                        <!-- WIDGET PREVIEW -->
                        <div class="col-6">
                    <Grafico
                        v-if="widgetType == 'grafico'"
                        :config="ncConfig"
                    >
                    </Grafico>
                    <Switch
                        v-if="widgetType == 'switch'"
                        :config="SwitchConfig"
                    >
                    </Switch>
                    <boton
                        v-if="widgetType == 'boton'"
                        :config="configButton"
                    >
                    </boton>
                    <Indicador
                        v-if="widgetType == 'indicador'"
                        :config="IndicatorConfig"
                    >
                    </Indicador>
                        </div>

                        <!-- ADD WIDGET BUTTON -->
                        <div class="row pull-right">
                        <div class="col-12">
                        <base-button
                            native-type="submit"
                            type="primary"
                            class="mb-3"
                            size="lg"
                            @click="addNewWidget()"
                        >
                        Add Widget
                        </base-button>
          </div>
                        </div>
                    </div>

                </div>
            </card>
        </div>  
    </div>
</template>

<script>

import Indicador from '../components/Widgets/Indicador.vue';
import Boton from '../components/Widgets/Boton.vue';
import Grafico from '../components/Widgets/Grafico.vue';
import Switch from '../components/Widgets/Switch.vue';

export default {

    components: { Indicador, Boton, Grafico, Switch },

    data() {
        return {

            widgets: [],
            templates: [],
            widgetType: "",
            templateName: "",
            templateDescription: "",

            ncConfig: {
                userId: "sampleuserid",
                selectedDevice: {
                    name: "Home",
                    dId: "8888"
                },
                variableFullName: "temperature",
                variable: "varname",
                variableType: "input",
                variableSendFreq: "30",
                unit: "Watts",
                class: "success",
                column: "col-12",
                decimalPlaces: 2,
                widget: "numberchart",
                icon: "fa-sun",
                chartTimeAgo: 60,
                demo: true
            },

            SwitchConfig: {
                userId: "userid",
                selectedDevice: {
                    name: "Home",
                    dId: "8888"
                },
                variableFullName: "Luz",
                variable: "varname",
                variableType: "output",
                class: "danger",
                widget: "switch",
                icon: "fa-bath",
                column: "col-6"
            },

            IndicatorConfig: {
                userId: "userid",
                selectedDevice: {
                    name: "Home",
                    dId: "8888"
                },
                variableFullName: "temperature",
                variable: "varname",
                variableType: "input",
                variableSendFreq: "30",
                class: "success",
                widget: "indicator",
                icon: "fa-bath",
                column: "col-6"
            },

            configButton: {
                userId: "userid",
                selectedDevice: {
                    name: "Home",
                    dId: "8888",
                    templateName: "Power Sensor",
                    templateId: "984237562348756ldksjfh",
                    saverRule: false
                },
                variableFullName: "Pump",
                variable: "var1",
                variableType: "output",
                icon: "fa-sun",
                column: "col-4",
                widget: "button",
                class: "danger",
                message: "{'fanstatus': 'stop'}"
            },
        }
    },

    methods: {

    }
}
</script>
