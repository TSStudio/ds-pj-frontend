<template>
    <div id="l-control" class="on">
        <h1>TSStudio GIS</h1>
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="选点" name="point_manager">
                <div>
                    <h2>选点</h2>
                    经度:{{ mouse_lon_c.toFixed(5) }} 纬度:{{
                        mouse_lat_c.toFixed(5)
                    }}
                    <el-button type="primary" @click="add_selected_point()"
                        >加入点集</el-button
                    >
                </div>
                <div>
                    <h2>搜索</h2>
                    <el-input
                        v-model="addr_input"
                        style="width: 100%"
                        placeholder="输入地址"
                    /><br />
                    <el-select
                        v-model="search_api"
                        placeholder="选择API"
                        style="width: 100%"
                    >
                        <el-option label="高德" value="amap" />
                        <el-option label="Bing" value="bing" />
                    </el-select>
                    <el-button
                        type="primary"
                        @click="search_point()"
                        :disabled="searching"
                        >搜索</el-button
                    >
                    <el-button
                        type="danger"
                        @click="truncate_search_result()"
                        :disabled="searching"
                        >清空搜索结果</el-button
                    >
                    <el-table :data="search_result" stripe style="width: 100%">
                        <el-table-column prop="name" label="名称" />
                        <el-table-column prop="operation" label="操作"
                            ><template #default="scope"
                                ><el-button
                                    size="small"
                                    @click="
                                        lookPointSearchResult(
                                            scope.$index,
                                            scope.row
                                        )
                                    "
                                    >查看</el-button
                                ><el-button
                                    size="small"
                                    type="primary"
                                    @click="
                                        addPointSearchResult(
                                            scope.$index,
                                            scope.row
                                        )
                                    "
                                    >加入点集</el-button
                                ></template
                            ></el-table-column
                        >
                    </el-table>
                </div>
                <h2>点集</h2>
                <el-table :data="points" stripe style="width: 100%">
                    <el-table-column prop="type" label="类型" width="60" />
                    <el-table-column prop="addr" label="地点" />
                    <el-table-column prop="operation" label="操作" width="100">
                        <template #default="scope"
                            ><el-button
                                size="small"
                                @click="lookPoint(scope.$index, scope.row)"
                                >查看</el-button
                            ><el-button
                                size="small"
                                type="primary"
                                @click="update_location(scope.$index)"
                                >查询地址</el-button
                            ><el-button
                                size="small"
                                type="danger"
                                @click="deletePoint(scope.$index)"
                                >删除</el-button
                            ></template
                        >
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="路线" name="routing">
                <h2>路径</h2>
                <div>
                    <el-checkbox
                        v-model="methods.walking"
                        label="步行"
                        size="large"
                    />
                    <el-checkbox
                        v-model="methods.cycling"
                        label="骑行"
                        size="large"
                    />
                    <el-checkbox
                        v-model="methods.driving"
                        label="驾车"
                        size="large"
                    />
                    <el-checkbox
                        v-model="methods.transit"
                        label="公交"
                        size="large"
                    />
                    <el-checkbox
                        v-model="methods.subway"
                        label="地铁"
                        size="large"
                    />
                </div>
                <el-button type="primary" @click="route_all(false)"
                    >全部寻路（Dijkstra）</el-button
                >
                <el-button type="primary" @click="route_all(true)"
                    >全部寻路（启发式）</el-button
                >
                <el-button
                    type="primary"
                    @click="rearrange_using_salesman()"
                    :disabled="revertable"
                    >重新排序（TSP）</el-button
                >
                <div class="heuristic-factor-slider">
                    <span
                        class="demonstration"
                        title="系数越小越准确，但是慢；系数越大越快，但是准确性略有下降。推荐0.7-1.2。"
                        >启发式系数：{{
                            (heuristic_factor / 50).toFixed(2)
                        }}</span
                    >
                    <el-slider
                        v-model="heuristic_factor"
                        :format-tooltip="formatTooltip"
                    />
                </div>
                <el-switch
                    v-model="routing_debug"
                    active-text="调试"
                    inactive-text="正常"
                />
                <!--
                <el-switch
                    v-model="routing_jump"
                    active-text="跳跃"
                    inactive-text="正常"
                />-->
                <el-select
                    v-model="routing_key"
                    placeholder="Select"
                    style="width: 150px; margin-left: 20px"
                >
                    <el-option label="时间优先" value="time" />
                    <el-option label="路程优先" value="distance" />
                </el-select>
                <el-button
                    type="danger"
                    @click="apply_rearrange()"
                    v-if="revertable"
                    >接受重排</el-button
                >
                <el-button
                    type="primary"
                    @click="revert_rearrange()"
                    v-if="revertable"
                >
                    还原顺序
                </el-button>
                <el-table :data="points_to_route" stripe style="width: 100%">
                    <el-table-column prop="addr" label="地点" />
                    <el-table-column prop="operation" label="操作" width="200">
                        <template #default="scope"
                            ><el-button
                                size="small"
                                @click="lookPoint(scope.$index, scope.row)"
                                >查看</el-button
                            ><el-button
                                size="small"
                                @click="moveUp(scope.$index, scope.row)"
                                :disabled="scope.$index == 0"
                                >↑</el-button
                            ><el-button
                                size="small"
                                @click="moveDown(scope.$index, scope.row)"
                                :disabled="
                                    scope.$index == points_to_route.length - 1
                                "
                                >↓</el-button
                            ><el-button
                                size="small"
                                @click="
                                    removeRoutingPoint(scope.$index, scope.row)
                                "
                                >移除</el-button
                            ></template
                        >
                    </el-table-column>
                </el-table>
                <h2>点集</h2>
                <el-table :data="points" stripe style="width: 100%">
                    <el-table-column prop="type" label="类型" width="60" />
                    <el-table-column prop="addr" label="地点" />
                    <el-table-column prop="operation" label="操作" width="100">
                        <template #default="scope"
                            ><el-button
                                size="small"
                                @click="lookPoint(scope.$index, scope.row)"
                                >查看</el-button
                            ><el-button
                                size="small"
                                type="primary"
                                @click="
                                    addPointRouting(scope.$index, scope.row)
                                "
                                >加入路径</el-button
                            ></template
                        >
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="寻路" name="route_progress">
                <div v-show="!viewDetails">
                    <h2>任务</h2>
                    <el-button
                        type="primary"
                        @click="look_full_route()"
                        :disabled="taskFinished != tasks.length"
                        v-show="tasks.length > 0"
                        >查看全部</el-button
                    >
                    <el-button
                        type="primary"
                        @click="hide_route()"
                        v-show="routeshowlayer"
                        >隐藏路径显示</el-button
                    >
                    <el-button
                        type="primary"
                        @click="hide_debug_polygon()"
                        v-show="routing_debug_layer"
                        >隐藏调试多边形</el-button
                    >
                    <el-table :data="tasks" stripe style="width: 100%">
                        <el-table-column prop="start_name" label="起点" />
                        <el-table-column prop="end_name" label="终点" />
                        <el-table-column
                            prop="status"
                            label="状态"
                            width="70"
                        />
                        <el-table-column
                            prop="operation"
                            label="操作"
                            width="80"
                        >
                            <template #default="scope"
                                ><el-button
                                    size="small"
                                    @click="lookRoute(scope.$index, scope.row)"
                                    :disabled="scope.row.view_ok == false"
                                    >查看</el-button
                                ><el-button
                                    size="small"
                                    @click="
                                        vier_r_details(scope.$index, scope.row)
                                    "
                                    :disabled="scope.row.view_ok == false"
                                    >详情</el-button
                                ></template
                            >
                        </el-table-column>
                    </el-table>
                </div>
                <div v-show="viewDetails">
                    <el-button type="primary" @click="viewDetails = false"
                        >返回</el-button
                    >
                    <routeviewer
                        :paths="view_route_paths"
                        :nodes="view_route_nodes"
                        ref="rv"
                        @look="lookRoute"
                    />
                </div>
            </el-tab-pane>
            <el-tab-pane label="区域" name="zone">
                <div v-show="!zoneEditing">
                    <h2>选区</h2>
                    你可以绘制多边形选区，以在寻路时只包含或排除特定区域。
                    应用选区会大幅降低寻路性能。
                    <el-table :data="zones" stripe style="width: 100%">
                        <el-table-column prop="name" label="名称" />
                        <el-table-column
                            prop="operation"
                            label="操作"
                            width="200"
                        >
                            <template #default="scope"
                                ><el-button
                                    size="small"
                                    @click="lookZone(scope.$index)"
                                    >查看</el-button
                                ><el-button
                                    size="small"
                                    @click="editZone(scope.$index)"
                                    >编辑</el-button
                                ><el-button
                                    size="small"
                                    type="danger"
                                    @click="removeZone(scope.$index)"
                                    >删除</el-button
                                ></template
                            >
                        </el-table-column>
                    </el-table>
                    <el-button type="primary" @click="addZone()"
                        >新建选区</el-button
                    ><br />

                    寻路时使用选区限制<el-switch
                        v-model="useZoneLimiter"
                        active-text="启用"
                        inactive-text="关闭"
                    /><br />
                    限制模式<el-switch
                        v-model="zoneWBList"
                        active-text="作为白名单"
                        inactive-text="作为黑名单"
                    /><br />
                    选区：<el-select
                        v-model="zoneSelecting"
                        placeholder="选择选区"
                        style="width: 150px"
                    >
                        <el-option
                            v-for="(zone, index) in zones"
                            :key="index"
                            :label="zone.name"
                            :value="index"
                        />
                    </el-select>
                </div>
                <div v-if="zoneEditing">
                    <h2>编辑选区</h2>
                    <el-input
                        v-model="zones[zoneEditingIndex].name"
                        style="width: 100%"
                        placeholder="选区名称"
                    />
                    点
                    <el-table
                        :data="zones[zoneEditingIndex].points"
                        stripe
                        style="width: 100%"
                    >
                        <el-table-column
                            prop="operation"
                            label="操作"
                            width="100"
                        >
                            <template #default="scope"
                                ><el-button
                                    size="small"
                                    @click="viewZonePoint(scope.$index)"
                                    >查看</el-button
                                ><el-button
                                    size="small"
                                    @click="moveInsertPointer(scope.$index)"
                                    :disabled="
                                        zonePointInsertingAt == scope.$index
                                    "
                                    >在此处插入</el-button
                                ><el-button
                                    size="small"
                                    @click="removeZonePoint(scope.$index)"
                                    >删除</el-button
                                ></template
                            >
                        </el-table-column>
                    </el-table>
                    <el-button type="primary" @click="zoneEditing = false"
                        >返回</el-button
                    >
                </div>
            </el-tab-pane>
            <el-tab-pane label="设置" name="settings">
                <h2>设置</h2>
                <!--set api base-->
                <el-select
                    v-model="apibase"
                    placeholder="选择API"
                    style="width: 100%"
                >
                    <el-option
                        v-for="(value, key) in bases"
                        :key="key"
                        :label="key"
                        :value="value"
                    />
                </el-select>
            </el-tab-pane>
            <el-tab-pane label="预设点集" name="presets">
                <span v-if="!loggedin">正在检查您的权限，请稍等。</span>
                <div v-if="loggedin">
                    <el-input v-model="psetname" placeholder="新点集名称" />
                    <el-button type="primary" @click="new_point_set()"
                        >新建点集</el-button
                    >
                    <el-table
                        :data="psets"
                        stripe
                        style="width: 100%"
                        v-loading="psetOperationInProcess"
                    >
                        <el-table-column prop="name" label="名称" />
                        <el-table-column
                            prop="operation"
                            label="操作"
                            width="100"
                        >
                            <template #default="scope"
                                ><el-button
                                    size="small"
                                    @click="
                                        loadRemotePointSet(
                                            scope.$index,
                                            scope.row
                                        )
                                    "
                                    >使用</el-button
                                ><el-button
                                    size="small"
                                    type="danger"
                                    @click="
                                        deleteRemotePointSet(
                                            scope.$index,
                                            scope.row
                                        )
                                    "
                                    >删除</el-button
                                ></template
                            >
                        </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
    <div id="r-main">
        <div id="r-control" class="on">&lt;</div>
        <div id="map"></div>
    </div>
</template>
<script>
import L from "leaflet";
import { toRaw } from "vue";
import * as tapi from "./tapinterface.js";
import coord from "./coord.js";
import keys from "./keys.js";

import routeviewer from "./route_viewer.vue";

const options = {
    center: [31.24555, 121.506294],
    tileSize: 256,
    depth: 18,
}; //center: [31.24555, 121.506294],
//            zoom: 13,

L.TileLayer.SVG = L.TileLayer.extend({
    createTile: function (coords, done) {
        //var tile = document.createElement("div");

        // tile.setAttribute("role", "presentation");
        // tile.classList.add("svg-tile");

        // fetch(this.getTileUrl(coords))
        //     .then((response) => {
        //         if (!response.ok) {
        //             throw new Error("Network response was not ok");
        //         }
        //         return response.text();
        //     })
        //     .then((svgText) => {
        //         const parser = new DOMParser();
        //         const svg = parser.parseFromString(
        //             svgText,
        //             "image/svg+xml"
        //         ).documentElement;
        //         tile.appendChild(svg);
        //         done(null, tile);
        //     })
        //     .catch((error) => {
        //         done(error, tile);
        //     });
        // let obj = document.createElement("object");
        // obj.setAttribute("type", "image/svg+xml");
        // obj.setAttribute("data", this.getTileUrl(coords));
        // obj.setAttribute("width", options.tileSize);
        // obj.setAttribute("height", options.tileSize);
        // tile.appendChild(obj);
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("role", "presentation");
        svg.classList.add("svg-tile");
        svg.setAttribute("width", options.tileSize);
        svg.setAttribute("height", options.tileSize);
        fetch(this.getTileUrl(coords))
            .then((response) => response.text())
            .then((data) => {
                const parser = new DOMParser();

                svg.innerHTML = parser.parseFromString(
                    data,
                    "image/svg+xml"
                ).documentElement.innerHTML;
                done(null, svg);
            });
        return svg;
    },
});

export default {
    name: "App",
    data() {
        return {
            apibase: "",
            bases: {
                本地: "http://local.tmysam.top:11222",
                服务器2: "http://192.168.5.49:11222",
            },
            activeName: "point_manager",
            map: null,
            mouse_x: 0,
            mouse_y: 0,
            mouse_lat: 0,
            mouse_lon: 0,
            mouse_lat_c: 0,
            mouse_lon_c: 0,
            zoomlevel: 0,
            nearest_node_id_c: 0,
            nearest_node_distance_c: 0,
            start: 0,
            end: 0,
            marker: null,
            routeshowlayer: null,
            searchMarker: null,
            tooltipLayer: null,
            points: [],
            addr_input: "",
            search_result: [],
            points_to_route: [],
            points_to_route_backup: [],
            revertable: false,
            routing_debug: false,
            routing_jump: false,
            routing_debug_layer: null,
            routing_key: "time",
            tasks: [],
            taskFinished: 0,
            searching: false,
            mouseDownTime: 0,
            isMouseDown: false,
            mouseDownX: 0,
            mouseDownWidth: 0,
            methods: {
                walking: true,
                cycling: false,
                driving: false,
                transit: false,
                subway: false,
            },
            viewDetails: false,
            zoneEditing: false,
            zoneEditingIndex: 0,
            zonePointInsertingAt: 0,
            zoneSelecting: 0,
            useZoneLimiter: false,
            zoneWBList: false,
            isMoving: false,
            imageOverlay: null,
            imageOverlayLoadLock: false,
            heuristic_factor: 50,
            view_route_paths: [],
            view_route_nodes: {},
            satellite_layer: null,
            search_api: "amap",
            zones: [],
            zone_polygon: null,
            loggedin: false,
            psetname: "",
            psets: [],
            psetOperationInProcess: false,
        };
    },
    methods: {
        loadRemotePointSet_confirmed(index, row) {
            let api = new tapi.TAPInterface();
            api.get_points(row.setid).then((data) => {
                let pts = [];
                data.data.points.forEach((point) => {
                    let id = Math.floor(Math.random() * 1000000000);
                    pts.push({
                        id: id,
                        selected_lat: parseFloat(point.selected_lat),
                        selected_lon: parseFloat(point.selected_lon),
                        addr: point.addr,
                        nearest_node_id: parseInt(point.nearest_node_id),
                        type: point.type,
                    });
                });
                this.points = pts;
            });
        },
        loadRemotePointSet(index, row) {
            ElMessageBox.alert("这将覆盖您现有的点集。", "加载远程点集", {
                confirmButtonText: "确认",
                callback: (action) => {
                    if (action == "confirm") {
                        this.loadRemotePointSet_confirmed(index, row);
                    }
                },
            });
        },
        get_point_sets() {
            let api = new tapi.TAPInterface();
            api.get_sets().then((data) => {
                this.psets = data.data;
                this.psetOperationInProcess = false;
            });
        },
        deleteRemotePointSet(index, row) {
            this.psetOperationInProcess = true;
            let api = new tapi.TAPInterface();
            api.delete_set(row.setid).finally(() => {
                this.get_point_sets();
            });
        },
        new_point_set_raw(name) {
            this.psetOperationInProcess = true;
            let api = new tapi.TAPInterface();
            let pts = [];
            this.points.forEach((point) => {
                pts.push({
                    selected_lat: point.selected_lat,
                    selected_lon: point.selected_lon,
                    addr: point.addr,
                    nearest_node_id: point.nearest_node_id,
                    type: point.type,
                });
            });
            return api.new_set(name, pts);
        },
        new_point_set() {
            this.new_point_set_raw(this.psetname).finally(() => {
                this.get_point_sets();
            });
        },
        hideAllOverlays() {
            if (this.marker != null) {
                this.map.removeLayer(this.marker);
            }
            this.hide_route();
            this.hide_debug_polygon();
            this.hide_zone_polygon();
        },
        hide_zone_polygon() {
            if (this.zone_polygon != null) {
                this.map.removeLayer(this.zone_polygon);
                this.zone_polygon = null;
            }
        },
        moveInsertPointer(index) {
            this.zonePointInsertingAt = index;
        },
        tryPolygonPointAdd(lat, lon) {
            if (!this.zoneEditing) {
                return;
            }
            this.zones[this.zoneEditingIndex].points.splice(
                this.zonePointInsertingAt + 1,
                0,
                [lat, lon]
            );
            this.zonePointInsertingAt = this.zonePointInsertingAt + 1;
            if (this.marker != null) {
                this.map.removeLayer(this.marker);
            }
            this.lookZone(this.zoneEditingIndex, true);
            this.marker = L.marker([lat, lon]).addTo(this.map);
        },
        viewZonePoint(index) {
            if (this.marker != null) {
                this.map.removeLayer(this.marker);
            }
            this.marker = L.marker(
                this.zones[this.zoneEditingIndex].points[index]
            ).addTo(this.map);
        },
        removeZonePoint(index) {
            this.zones[this.zoneEditingIndex].points.splice(index, 1);
            //check index and zoneEditingIndex
            if (this.index >= this.zonePointInsertingAt) {
                this.zonePointInsertingAt--;
            }
            this.lookZone(this.zoneEditingIndex, true);
        },
        editZone(index) {
            this.zoneEditing = true;
            this.zoneEditingIndex = index;
            this.zonePointInsertingAt = 0;
            this.lookZone(index, true);
        },
        addZone() {
            this.zones.push({
                name: "新建选区",
                points: [],
            });
        },
        removeZone(index) {
            this.zones.splice(index, 1);
        },
        lookZone(index, hideWarning = false) {
            //check points count, if <3, return
            this.hideAllOverlays();
            if (this.zones[index].points.length < 3) {
                if (!hideWarning) {
                    ElMessage.info("选区至少需要3个点才能显示");
                }
                return;
            }

            let latlngs = [];
            this.zones[index].points.forEach((point) => {
                latlngs.push([point[0], point[1]]);
            });
            this.zone_polygon = L.polygon(latlngs, {
                color: "#ff00ff",
                opacity: 0.5,
            }).addTo(this.map);
            this.map.fitBounds(this.zone_polygon.getBounds());
        },
        moveUp(index, row) {
            let temp = this.points_to_route[index];
            this.points_to_route[index] = this.points_to_route[index - 1];
            this.points_to_route[index - 1] = temp;
        },
        moveDown(index, row) {
            let temp = this.points_to_route[index];
            this.points_to_route[index] = this.points_to_route[index + 1];
            this.points_to_route[index + 1] = temp;
        },
        getcolor(method) {
            switch (method) {
                case 1:
                    return "#2222ff";
                case 2:
                    return "#7777ff";
                case 4:
                    return "#000000";
                case 8:
                    return "#ff8800";
                case 16:
                    return "#ff88cc";
                default:
                    return "#000000";
            }
        },
        look_route_raw(nodes, paths, routeLayer, tooltipLayer) {
            let latlngs = [];
            let lastmethod = 0;
            let lastRoadName = "";
            let totdistance = 0;
            let halfdistance = 0;
            let halfdistanceIndex = 0;
            if (paths == undefined) {
                return;
            }
            if (paths.length == 0) {
                return;
            }
            latlngs.push([
                nodes[paths[0].start].lat,
                nodes[paths[0].start].lon,
            ]);
            for (let i = 0; i < paths.length; i++) {
                let path = paths[i];
                if (path.method != lastmethod) {
                    L.polyline(latlngs, {
                        color: this.getcolor(lastmethod),
                    }).addTo(routeLayer);
                    lastmethod = path.method;
                    latlngs = [];
                    latlngs.push([
                        nodes[path.start].lat,
                        nodes[path.start].lon,
                    ]);
                }
                latlngs.push([nodes[path.end].lat, nodes[path.end].lon]);
                if (path.name) {
                    if (path.name != lastRoadName) {
                        let tooltip = L.tooltip({
                            permanent: true,
                            direction: "center",
                            className: "tooltip",
                            offset: [0, 0],
                            opacity: 0.8,
                            sticky: true,
                        })
                            .setContent(lastRoadName)
                            .setLatLng([
                                nodes[paths[halfdistanceIndex].start].lat,
                                nodes[paths[halfdistanceIndex].start].lon,
                            ]);
                        tooltipLayer.addLayer(tooltip);
                        totdistance = 0;
                        halfdistance = 0;
                        halfdistanceIndex = i;
                        lastRoadName = path.name;
                    }
                }
                totdistance += path.distance;
                while (halfdistance < totdistance / 2) {
                    halfdistance += paths[halfdistanceIndex].distance;
                    halfdistanceIndex += 1;
                }
            }
            L.polyline(latlngs, {
                color: this.getcolor(lastmethod),
            }).addTo(routeLayer);
        },
        look_routing_debug_polygon(nodes, force = false, color = "#ff00cc") {
            let latlngs = [];
            for (let i = 0; i < nodes.length; i++) {
                latlngs.push([nodes[i].lat, nodes[i].lon]);
            }
            if (this.routing_debug_layer != null && !force) {
                this.hide_debug_polygon();
            }

            let polygon_layer = L.featureGroup();
            // this.routing_debug_layer = L.polygon(latlngs, {
            //     color: color,
            //     opacity: 0.5,
            // }).addTo(this.map);
            let polygon = L.polygon(latlngs, {
                color: color,
                opacity: 0.5,
            }).addTo(polygon_layer);
            if (this.routing_debug_layer == null) {
                this.routing_debug_layer = polygon_layer.addTo(this.map);
            } else {
                this.routing_debug_layer.addLayer(polygon);
            }
            //polygon_layer.addTo(this.map);
        },
        hide_route() {
            this.hide_debug_polygon();
            if (this.routeshowlayer != null) {
                this.map.removeLayer(this.routeshowlayer);
                this.routeshowlayer = null;
            }
            if (this.tooltipLayer != null) {
                this.map.removeLayer(this.tooltipLayer);
                this.tooltipLayer = null;
            }
        },
        hide_debug_polygon() {
            if (this.routing_debug_layer != null) {
                this.map.removeLayer(this.routing_debug_layer);
                this.routing_debug_layer = null;
            }
        },
        look_full_route() {
            let routeLayer = L.featureGroup();
            let tooltipLayer = L.layerGroup();
            this.tasks.forEach((task) => {
                this.look_route_raw(
                    task.result.nodes,
                    task.result.path,
                    routeLayer,
                    tooltipLayer
                );
            });
            this.hideAllOverlays();
            this.routeshowlayer = routeLayer.addTo(this.map);
            this.tooltipLayer = tooltipLayer.addTo(this.map);
            this.map.fitBounds(this.routeshowlayer.getBounds());
        },

        lookRoute(index, row) {
            let routeLayer = L.featureGroup();
            let tooltipLayer = L.layerGroup();
            this.look_route_raw(
                row.result.nodes,
                row.result.path,
                routeLayer,
                tooltipLayer
            );
            this.hideAllOverlays();
            this.routeshowlayer = routeLayer.addTo(this.map);
            this.tooltipLayer = tooltipLayer.addTo(this.map);
            if (row.result.nodes_ch) {
                this.look_routing_debug_polygon(row.result.nodes_ch);
            }
            if (row.result.nodes_ch2) {
                this.look_routing_debug_polygon(
                    row.result.nodes_ch2,
                    true,
                    "#cc00ff"
                );
            }
            this.map.fitBounds(this.routeshowlayer.getBounds());
        },
        vier_r_details(index, row) {
            this.view_route_nodes = row.result.nodes;
            this.view_route_paths = row.result.path;
            this.viewDetails = true;
        },
        revert_rearrange() {
            this.points_to_route = this.points_to_route_backup;
            this.revertable = false;
        },
        apply_rearrange() {
            this.revertable = false;
        },
        rearrange_using_salesman() {
            let methods = 0;
            if (this.methods.walking) {
                methods += 1;
            }
            if (this.methods.cycling) {
                methods += 2;
            }
            if (this.methods.driving) {
                methods += 4;
            }
            if (this.methods.transit) {
                methods += 8;
            }
            if (this.methods.subway) {
                methods += 16;
            }
            if (methods == 0) {
                ElMessage.error("请选择至少一种寻路方式");
                return;
            }
            let url =
                this.apibase +
                "/salesman?method=" +
                methods +
                "&heuristic_factor=" +
                this.heuristic_factor / 50;

            if (this.routing_key == "time") {
                url += "&key=0";
            } else {
                url += "&key=1";
            }

            let nodes = [];
            this.points_to_route.forEach((point) => {
                nodes.push([point.nearest_node_id]);
            });
            url += "&nodes=" + encodeURIComponent(btoa(JSON.stringify(nodes)));
            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data); //data like [id,id,id,...]
                    this.points_to_route_backup = this.points_to_route;
                    this.points_to_route = [];
                    data.forEach((id) => {
                        this.points_to_route.push(
                            this.points_to_route_backup.find((point) => {
                                return point.nearest_node_id == id;
                            })
                        );
                    });
                    this.revertable = true;
                });
        },
        route_all(heuristic) {
            this.view_route_paths = [];
            this.view_route_nodes = {};
            let tasks = [];
            let methods = 0;
            if (this.methods.walking) {
                methods += 1;
            }
            if (this.methods.cycling) {
                methods += 2;
            }
            if (this.methods.driving) {
                methods += 4;
            }
            if (this.methods.transit) {
                methods += 8;
            }
            if (this.methods.subway) {
                methods += 16;
            }
            if (methods == 0) {
                ElMessage.error("请选择至少一种寻路方式");
                return;
            }
            this.taskFinished = 0;
            for (let i = 0; i < this.points_to_route.length - 1; i++) {
                tasks.push({
                    start: this.points_to_route[i].nearest_node_id,
                    start_name: this.points_to_route[i].addr,
                    end: this.points_to_route[i + 1].nearest_node_id,
                    end_name: this.points_to_route[i + 1].addr,
                    view_ok: false,
                    status: "未开始",
                    result: {},
                });
            }
            //switch to route progress
            this.activeName = "route_progress";

            this.tasks = tasks;
            this.tasks.forEach((task) => {
                if (task.start == 0 || task.end == 0) {
                    return;
                }
                if (task.start == task.end) {
                    return;
                }
                task.status = "进行中";
                let url =
                    this.apibase +
                    "/find_path?start=" +
                    task.start +
                    "&end=" +
                    task.end +
                    "&method=" +
                    methods;
                if (heuristic) {
                    url += "&heuristic_factor=" + this.heuristic_factor / 50;
                }
                if (this.routing_key == "time") {
                    url += "&key=0";
                } else {
                    url += "&key=1";
                }
                if (this.routing_debug) {
                    url += "&view_search_range";
                }
                if (this.routing_jump) {
                    url += "&jump";
                }
                if (this.useZoneLimiter) {
                    url += "&zoneWBList=" + (this.zoneWBList ? "1" : "0");
                    //zone json in payload [{x,y},...]
                    let bd = JSON.stringify(
                        this.zones[this.zoneSelecting].points
                    );
                    let bd_base64 = btoa(bd);
                    //urlencode
                    bd_base64 = encodeURIComponent(bd_base64);
                    url += "&zone=" + bd_base64;
                }

                fetch(url)
                    .then((response) => response.json())
                    .then((data) => {
                        task.result = data;
                        task.status =
                            "完成\n" +
                            (data.pathfinding_time / 1000).toFixed(2) +
                            "ms";
                        task.view_ok = true;
                        this.taskFinished += 1;
                    })
                    .catch((error) => {
                        task.status = "失败";
                        console.error("Error:", error);
                    });
            });
        },
        formatTooltip(val) {
            return val / 50;
        },
        removeRoutingPoint(index, row) {
            this.points_to_route.splice(index, 1);
        },
        addPointRouting(index, row) {
            this.points_to_route.push(row);
        },
        truncate_search_result() {
            this.search_result = [];
            localStorage.removeItem("search_result");
        },
        search_point() {
            this.searching = true;
            //https://restapi.amap.com/v5/place/text?key=&keywords={addr_input}&region=310000&city_limit=true
            let addr_input = encodeURIComponent(this.addr_input);
            if (this.search_api == "amap") {
                fetch(
                    "https://restapi.amap.com/v5/place/text?key=" +
                        keys.AMAP_API_KEY +
                        "&keywords=" +
                        addr_input +
                        "&region=310000&city_limit=false"
                )
                    .then((response) => response.json())
                    .then((data) => {
                        this.searching = false;
                        let sresult = [];
                        data.pois.forEach((result) => {
                            let loc = result.location.split(",");
                            let loc_trans = coord.gcj02towgs84(
                                parseFloat(loc[0]),
                                parseFloat(loc[1])
                            );
                            sresult.push({
                                name: result.name,
                                location: loc_trans[0] + "," + loc_trans[1],
                            });
                        });
                        this.search_result = sresult;
                        //local storage
                        localStorage.setItem(
                            "search_result",
                            JSON.stringify(sresult)
                        );
                    });
            }
            if (this.search_api == "bing") {
                fetch(
                    "https://atlas.microsoft.com/geocode?api-version=2023-06-01&top=10&query=" +
                        addr_input +
                        "&subscription-key=" +
                        keys.AZURE_API_KEY
                )
                    .then((response) => response.json())
                    .then((data) => {
                        this.searching = false;
                        // this.search_result = data.results;
                        // we need to convert the data to the same format as amap
                        let results = [];
                        data.features.forEach((result) => {
                            let coord =
                                result.properties.geocodePoints[0].geometry
                                    .coordinates;
                            results.push({
                                name: result.properties.address
                                    .formattedAddress,
                                location: coord[0] + "," + coord[1],
                            });
                        });
                        this.search_result = results;
                        //local storage
                        localStorage.setItem(
                            "search_result",
                            JSON.stringify(results)
                        );
                    });
            }
        },
        addPointSearchResult(index, row) {
            let id = Math.floor(Math.random() * 1000000000);
            let lat = parseFloat(row.location.split(",")[1]);
            let lon = parseFloat(row.location.split(",")[0]);
            this.points.push({
                selected_lat: lat,
                selected_lon: lon,
                nearest_node_id: 0,
                type: "搜索",
                addr: row.name,
                id: id,
                routing: false,
            });
            //this.update_location(this.points.length - 1);
            this.update_nearest_node(this.points.length - 1);
        },
        lookPointSearchResult(index, row) {
            if (this.searchMarker != null) {
                this.map.removeLayer(this.searchMarker);
            }
            this.searchMarker = L.marker([
                row.location.split(",")[1],
                row.location.split(",")[0],
            ]).addTo(toRaw(this.map));
            this.map.setView(
                [row.location.split(",")[1], row.location.split(",")[0]],
                this.map.getZoom(),
                {
                    animate: true,
                    pan: {
                        duration: 0.5,
                    },
                }
            );
        },
        toggle_l_control() {
            var l_control = document.getElementById("l-control");
            var r_control = document.getElementById("r-control");
            if (l_control.className == "on") {
                l_control.className = "off";
                r_control.innerHTML = "&gt;";
                l_control.style.marginLeft =
                    "-" +
                    document.getElementById("l-control").offsetWidth +
                    "px";
            } else {
                l_control.className = "on";
                r_control.innerHTML = "&lt;";
                l_control.style.marginLeft = "0px";
            }
            setTimeout(() => {
                this.map.invalidateSize({ pan: false });
            }, 350);
        },
        lookPoint(index, row) {
            if (this.marker != null) {
                this.map.removeLayer(this.marker);
            }
            this.marker = L.marker([row.selected_lat, row.selected_lon]).addTo(
                this.map
            );
            this.map.setView(
                [row.selected_lat, row.selected_lon],
                this.map.getZoom(),
                {
                    animate: true,
                    pan: {
                        duration: 0.5,
                    },
                }
            );
        },
        deletePoint(index) {
            this.points.splice(index, 1);
        },
        add_selected_point() {
            let id = Math.floor(Math.random() * 1000000000);
            this.points.push({
                selected_lat: this.mouse_lat_c,
                selected_lon: this.mouse_lon_c,
                nearest_node_id: 0,
                type: "选点",
                addr: "",
                id: id,
            });
            this.update_nearest_node(this.points.length - 1);
        },
        update_nearest_node(rowIndex) {
            let _point = this.points[rowIndex];
            fetch(
                this.apibase +
                    "/find_nearest_node?lat=" +
                    _point.selected_lat +
                    "&lon=" +
                    _point.selected_lon
            )
                .then((response) => response.json())
                .then((data) => {
                    this.nearest_node_id_c = data.id;
                    this.points.forEach((__point) => {
                        if (__point.id == _point.id) {
                            __point.nearest_node_id = data.id;
                            if (__point.addr == "") {
                                __point.addr = data.id;
                            }
                        }
                    });
                });
        },
        update_location(rowIndex) {
            let _point = this.points[rowIndex];
            //126.783794,30.242072
            //140.618561,46.612512
            //is a cut line between China and Japan.
            //use amap for China, use azure for Japan

            // vec A (13.834767,16.37044,0)
            // vec B (lon-126.783794,lat-30.242072,0)
            // check if z coord of A X B is positive, if positive then point is in China

            let country = "China";
            let vecA = [13.834767, 16.37044, 0];
            let vecB = [
                _point.selected_lon - 126.783794,
                _point.selected_lat - 30.242072,
                0,
            ];
            let vecC = [
                vecA[1] * vecB[2] - vecA[2] * vecB[1],
                vecA[2] * vecB[0] - vecA[0] * vecB[2],
                vecA[0] * vecB[1] - vecA[1] * vecB[0],
            ];
            if (vecC[2] > 0) {
                country = "China";
            } else {
                country = "Japan";
            }
            if (country == "China") {
                let c = coord.wgs84togcj02(
                    _point.selected_lon,
                    _point.selected_lat
                );
                fetch(
                    "https://restapi.amap.com/v3/geocode/regeo?key=" +
                        keys.AMAP_API_KEY +
                        "&location=" +
                        c[0] +
                        "," +
                        c[1] +
                        "&extensions=all"
                )
                    .then((response) => response.json())
                    .then((data) => {
                        let output = "";
                        if (data.regeocode.aois.length > 0) {
                            output += data.regeocode.aois[0].name;
                        } else if (data.regeocode.pois.length > 0) {
                            output += data.regeocode.pois[0].name;
                        }
                        if (data.regeocode.roadinters.length > 0) {
                            output +=
                                "@" +
                                data.regeocode.roadinters[0].first_name +
                                data.regeocode.roadinters[0].second_name;
                        }
                        output += "(" + data.regeocode.formatted_address + ")";
                        this.points.forEach((__point) => {
                            if (__point.id == _point.id) {
                                __point.addr = output;
                            }
                        });
                    });
            } else {
                fetch(
                    "https://atlas.microsoft.com/reverseGeocode?api-version=2023-06-01&coordinates=" +
                        _point.selected_lon.toFixed(6) +
                        "," +
                        _point.selected_lat.toFixed(6) +
                        "&subscription-key=" +
                        keys.AZURE_API_KEY
                )
                    .then((response) => response.json())
                    .then((data) => {
                        let output = "";
                        if (data.features) {
                            if (data.features.length > 0) {
                                output =
                                    data.features[0].properties.address
                                        .formattedAddress;
                            }
                        }
                        this.points.forEach((__point) => {
                            if (__point.id == _point.id) {
                                __point.addr = output;
                            }
                        });
                    });
            }
        },

        get_nearest_node(lat, lon) {
            if (this.marker != null) {
                this.map.removeLayer(this.marker);
            }
            this.marker = L.marker([lat, lon]).addTo(this.map);
        },
        set_start() {
            if (this.nearest_node_id_c == 0) {
                return;
            }
            this.start = this.nearest_node_id_c;
        },
        set_end() {
            if (this.nearest_node_id_c == 0) {
                return;
            }
            this.end = this.nearest_node_id_c;
        },
        upd_text(force = false) {
            if (!this.isMoving && !force) {
                return;
            }
            if (this.imageOverlayLoadLock) {
                return;
            }
            let width = document.getElementById("map").offsetWidth;
            let height = document.getElementById("map").offsetHeight;
            let bounds = toRaw(this.map).getBounds();
            let lat_begin = bounds._northEast.lat;
            let lon_begin = bounds._southWest.lng;
            let lat_end = bounds._southWest.lat;
            let lon_end = bounds._northEast.lng;
            let zoom = this.map.getZoom();
            let url = `http://local.tmysam.top:11223/ds/text_whole.php?lat_begin=${lat_begin}&lon_begin=${lon_begin}&lat_end=${lat_end}&lon_end=${lon_end}&width=${width}&height=${height}&z=${zoom}&datauri`;
            if (this.map.hasLayer(this.satellite_layer)) {
                url += "&nost";
            }
            fetch(url)
                .then((response) => response.text())
                .then((text) => {
                    toRaw(this.imageOverlay).setUrl(text);
                    toRaw(this.imageOverlay).setBounds([
                        [lat_begin, lon_begin],
                        [lat_end, lon_end],
                    ]);
                })
                .finally(() => {
                    this.imageOverlayLoadLock = false;
                });
        },
    },
    mounted() {
        this.apibase = this.bases["本地"];
        //document.addEventListener("mousemove", this.handleMouseMove);
        this.map = L.map("map", {
            maxZoom: options.depth,
            attributionControl: false,
        }).setView(options.center, 13);
        var AttrControl = L.control.attribution().addTo(this.map);
        //AttrControl.setPrefix('<a href="https://leafletjs.com/">Leaflet</a>');
        AttrControl.setPrefix("");
        const satellite_layer = L.tileLayer(
            "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
            {
                maxZoom: 19,
                attribution:
                    '&copy; <a href="https://www.google.com/maps" target="_blank">Google Maps</a>',
            }
        ).setZIndex(0);
        this.satellite_layer = satellite_layer;
        const dev = L.tileLayer(
            //const dev = new L.TileLayer.SVG(
            "http://local.tmysam.top:11223/ds/base_tile.php?x={x}&y={y}&z={z}",
            {
                maxZoom: 19,
                attribution:
                    "&copy; <a href='https://www.tmysam.top/' target='_blank'>TSStudio PHP SVG Renderer</a>",
            }
        ).setZIndex(0);
        const neoneopath = L.tileLayer(
            //const neoneopath = new L.TileLayer.SVG(
            "http://local.tmysam.top:11223/ds/road_tile.php?x={x}&y={y}&z={z}",
            {
                maxZoom: 19,
                attribution:
                    "&copy; <a href='https://www.tmysam.top/' target='_blank'>TSStudio PHP SVG Renderer</a>",
            }
        ).setZIndex(0);
        var baseMaps = {
            卫星: satellite_layer,
            新版渲染: dev,
        };

        var overlayMaps = {
            船新路网附加: neoneopath,
        };

        this.imageOverlay = L.imageOverlay("", [
            [0, 0],
            [0, 0],
        ]).addTo(this.map);
        //base layer change
        this.map.on("baselayerchange", (e) => {
            this.upd_text(true);
        });
        this.map.on("zoomstart", (e) => {
            this.isMoving = true;
        });
        this.map.on("movestart", (e) => {
            this.isMoving = true;
        });
        this.map.on("zoomend", (e) => {
            this.isMoving = false;
            this.upd_text(true);
        });
        this.map.on("moveend", (e) => {
            this.isMoving = false;
            this.upd_text(true);
        });

        const layerControl = L.control
            .layers(baseMaps, overlayMaps)
            .addTo(toRaw(this.map));
        dev.addTo(toRaw(this.map));
        neoneopath.addTo(toRaw(this.map));
        L.control.scale().addTo(toRaw(this.map));

        this.map.on("click", (e) => {
            this.mouse_lat_c = e.latlng.lat;
            this.mouse_lon_c = e.latlng.lng;
            if (this.zoneEditing) {
                this.tryPolygonPointAdd(e.latlng.lat, e.latlng.lng);
            } else {
                this.get_nearest_node(e.latlng.lat, e.latlng.lng);
            }
        });
        this.map.on("mousemove", (e) => {
            this.mouse_lat = e.latlng.lat;
            this.mouse_lon = e.latlng.lng;
        });
        this.map.on("zoomend", (e) => {
            this.zoomlevel = this.map.getZoom();
            localStorage.setItem(
                "map_zoom",
                JSON.stringify(this.map.getZoom())
            );
        });
        this.map.on("moveend", (e) => {
            localStorage.setItem(
                "map_center",
                JSON.stringify(this.map.getCenter())
            );
        });
        if (localStorage.getItem("points") != null) {
            this.points = JSON.parse(localStorage.getItem("points"));
        }
        if (localStorage.getItem("search_result") != null) {
            this.search_result = JSON.parse(
                localStorage.getItem("search_result")
            );
        }
        if (localStorage.getItem("points_to_route") != null) {
            this.points_to_route = JSON.parse(
                localStorage.getItem("points_to_route")
            );
        }
        if (localStorage.getItem("methods") != null) {
            this.methods = JSON.parse(localStorage.getItem("methods"));
        }
        if (localStorage.getItem("map_center") != null) {
            this.map.setView(
                JSON.parse(localStorage.getItem("map_center")),
                JSON.parse(localStorage.getItem("map_zoom"))
            );
            setTimeout(this.upd_text(true), 50);
        }
        if (localStorage.getItem("zones") != null) {
            this.zones = JSON.parse(localStorage.getItem("zones"));
        }
        let r_control = document.getElementById("r-control");
        r_control.addEventListener("mousedown", (e) => {
            this.mouseDownTime = new Date().getTime();
            this.mouseDownX = e.clientX;
            this.mouseDownWidth =
                document.getElementById("l-control").offsetWidth;
            this.isMouseDown = true;
        });
        document.addEventListener("mousemove", (e) => {
            if (!this.isMouseDown) {
                return;
            }
            if (new Date().getTime() - this.mouseDownTime > 100) {
                let diff = e.clientX - this.mouseDownX;
                let l_control = document.getElementById("l-control");
                l_control.style.width = this.mouseDownWidth + diff + "px";
            }
        });
        document.addEventListener("mouseup", (e) => {
            this.isMouseDown = false;
            if (new Date().getTime() - this.mouseDownTime < 200) {
                this.toggle_l_control();
            }
            this.map.invalidateSize({ pan: false });
        });
        let api = new tapi.TAPInterface();
        api.checkLogin().then((data) => {
            if (data.ok) {
                this.loggedin = true;
                this.get_point_sets();
            }
        });
    },
    watch: {
        points: {
            handler: function (val, oldVal) {
                localStorage.setItem("points", JSON.stringify(val));
            },
            deep: true,
        },
        points_to_route: {
            handler: function (val, oldVal) {
                localStorage.setItem("points_to_route", JSON.stringify(val));
            },
            deep: true,
        },
        methods: {
            handler: function (val, oldVal) {
                localStorage.setItem("methods", JSON.stringify(val));
            },
            deep: true,
        },
        zones: {
            handler: function (val, oldVal) {
                localStorage.setItem("zones", JSON.stringify(val));
            },
            deep: true,
        },
    },
    components: {
        routeviewer,
    },
};
</script>
