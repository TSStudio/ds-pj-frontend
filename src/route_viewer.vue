<template>
    <div v-for="rt in route" class="route-view-row">
        {{ getFriendlyRoute(rt) }}
        <ElButton type="text" @click="lookDetailsRoute(rt)">查看</ElButton>
    </div>
    <!-- {{ paths }}
    {{ nodes }} -->
</template>
<script>
import { ElButton } from "element-plus";
import route_helper from "./route_helper";
export default {
    name: "RouteViewer",
    methods: {
        getFridndlyDistance(meter) {
            if (meter < 999) {
                return Math.round(meter) + "m";
            } else {
                return (meter / 1000).toFixed(2) + "km";
            }
        },
        getFriendlyExecute(method) {
            if (method == 1) {
                return "步行";
            }
            if (method == 2) {
                return "骑行";
            }
            if (method == 4) {
                return "行驶";
            }
            if (method == 8 || method == 16) {
                return "乘坐";
            }
        },
        getFriendlyRoute(rt) {
            if (rt.method == 8 || rt.method == 16) {
                return (
                    "在【" +
                    rt.from +
                    "】，乘坐【" +
                    rt.roadName +
                    "】，" +
                    this.getFridndlyDistance(rt.distance) +
                    "，到【" +
                    rt.to +
                    "】下车"
                );
            } else {
                return (
                    rt.direction +
                    "，进入【" +
                    (rt.roadName == undefined ? "无名路" : rt.roadName) +
                    "】，" +
                    this.getFriendlyExecute(rt.method) +
                    this.getFridndlyDistance(rt.distance)
                );
            }
        },
        lookDetailsRoute(row) {
            //@look="lookRoute(0,r)"
            let r = {
                result: {
                    nodes: this.nodes,
                    path: row.paths,
                },
            };
            this.$emit("look", 0, r);
        },
        updateRoute() {
            this.route = route_helper.getRouteDetails(this.nodes, this.paths);
        },
    },
    data() {
        return {
            route: [],
        };
    },
    props: {
        paths: {
            type: Array,
            required: true,
        },
        nodes: {
            type: Object,
            required: true,
        },
    },
    watch: {
        paths: function (newVal, oldVal) {
            if (newVal.length == 0) {
                this.route = [];
                return;
            }
            this.updateRoute();
        },
    },
};
</script>
