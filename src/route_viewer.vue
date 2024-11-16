<template>
    <div v-for="rt in route" class="route-view-row">
        {{ getFriendlyRoute(rt) }}
    </div>
</template>
<script>
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
            return (
                rt.direction +
                "，进入" +
                rt.roadName +
                "，" +
                this.getFriendlyExecute(rt.method) +
                this.getFridndlyDistance(rt.distance)
            );
        },
    },
    props: {
        route: {
            type: Array,
            required: true,
        },
    },
};
</script>
