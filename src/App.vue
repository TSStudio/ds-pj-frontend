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
                    />
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
                    <el-table-column prop="type" label="类型" width="80" />
                    <el-table-column prop="addr" label="地点" />
                    <el-table-column prop="operation" label="操作">
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
                <el-button type="primary" @click="route_all()"
                    >全部寻路</el-button
                >
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
                    <el-table-column prop="type" label="类型" width="80" />
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
                <h2>任务</h2>
                <el-button
                    type="primary"
                    @click="look_full_route()"
                    :disabled="taskFinished != tasks.length"
                    >查看全部</el-button
                >
                <el-table :data="tasks" stripe style="width: 100%">
                    <el-table-column prop="start_name" label="起点" />
                    <el-table-column prop="end_name" label="终点" />
                    <el-table-column prop="status" label="状态" width="70" />
                    <el-table-column prop="operation" label="操作" width="70">
                        <template #default="scope"
                            ><el-button
                                size="small"
                                @click="lookRoute(scope.$index, scope.row)"
                                :disabled="scope.row.status != '完成'"
                                >查看</el-button
                            ></template
                        >
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </div>
    <div id="r-main">
        <div id="r-control" class="on">&lt;</div>
        <div id="map"></div>
    </div>
    <!--<div id="debug-layer">
        <div id="cursor">
            lat:{{ mouse_lat }} lon:{{ mouse_lon }} z:{{ zoomlevel }}
        </div>
        <div id="cursor">
            lat:{{ mouse_lat_c }} lon:{{ mouse_lon_c }}, nearest:{{
                nearest_node_id_c
            }}, distance:{{ nearest_node_distance_c }}
        </div>
        <div id="cursor">start:{{ start }}, end:{{ end }}</div>
    </div>-->
</template>
<script>
import L, { marker } from "leaflet";
import { toRaw } from "vue";
const WorkDistribution = function (options) {
    let queue = [];
    const pool = [];

    // set up workers
    for (var i = 0; i < (options.concurrency || 4); i++) {
        const worker = new Worker(options.src);
        worker.working = false;
        pool.push(worker);
    }

    // execute the next item of work
    const processQueue = function () {
        // remove cancelled work items
        queue = queue.filter((work) => !work.cancel);
        if (!queue.length) return;
        const nextWorker = pool.filter((x) => !x.working)[0];
        if (!nextWorker) return;

        var work = queue.pop();

        nextWorker.working = true;
        nextWorker.onmessage = function (e) {
            nextWorker.working = false;
            if (work.cancel) return; // don't bother to notify if cancelled
            work.cb(e);
            processQueue();
        };
        nextWorker.postMessage(work.item);
    };

    return {
        push: function (item, cb) {
            const work = { item: item, cb: cb, cancel: false };
            queue.push(work);
            processQueue();
            return () => (work.cancel = true);
        },
    };
};

const options = {
    center: [31.24555, 121.506294],
    tileSize: 256,
    depth: 16, // precision is lost at any greater level
}; //center: [31.24555, 121.506294],
//            zoom: 13,

export default {
    name: "App",
    data() {
        return {
            activeName: "point_manager",
            map: null,
            workerPool: null,
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
        };
    },
    methods: {
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
        look_full_route() {
            let latlngs = [];
            let lastmethod = 0;
            let lastRoadName = "";
            let routeLayer = L.featureGroup();
            latlngs.push([
                this.tasks[0].result.nodes[this.tasks[0].result.path[0].start]
                    .lat,
                this.tasks[0].result.nodes[this.tasks[0].result.path[0].start]
                    .lon,
            ]);
            let tooltipLayer = L.layerGroup();
            this.tasks.forEach((task) => {
                if (task.result.path == undefined) {
                    return;
                }
                if (task.result.path.length == 0) {
                    return;
                }
                task.result.path.forEach((path) => {
                    if (path.method != lastmethod) {
                        L.polyline(latlngs, {
                            color: this.getcolor(lastmethod),
                        }).addTo(routeLayer);
                        lastmethod = path.method;
                        latlngs = [];
                        latlngs.push([
                            task.result.nodes[path.start].lat,
                            task.result.nodes[path.start].lon,
                        ]);
                    }
                    latlngs.push([
                        task.result.nodes[path.end].lat,
                        task.result.nodes[path.end].lon,
                    ]);
                    if (path.name) {
                        if (path.name != lastRoadName) {
                            lastRoadName = path.name;
                            let tooltip = L.tooltip({
                                permanent: true,
                                direction: "center",
                                className: "tooltip",
                                offset: [0, 0],
                                opacity: 0.8,
                                sticky: true,
                            })
                                .setContent(path.name)
                                .setLatLng([
                                    task.result.nodes[path.start].lat,
                                    task.result.nodes[path.start].lon,
                                ]);
                            tooltipLayer.addLayer(tooltip);
                        }
                    }
                });
            });
            L.polyline(latlngs, {
                color: this.getcolor(lastmethod),
            }).addTo(routeLayer);
            if (this.routeshowlayer != null) {
                this.map.removeLayer(this.routeshowlayer);
            }
            if (this.tooltipLayer != null) {
                this.map.removeLayer(this.tooltipLayer);
            }
            this.routeshowlayer = routeLayer.addTo(this.map);
            this.tooltipLayer = tooltipLayer.addTo(this.map);
            this.map.fitBounds(this.routeshowlayer.getBounds());
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
        lookRoute(index, row) {
            if (row.result.path == undefined) {
                return;
            }
            if (row.result.path.length == 0) {
                return;
            }
            let latlngs = [];
            let lastmethod = 0;
            let lastRoadName = "";
            let routeLayer = L.featureGroup();
            latlngs.push([
                row.result.nodes[row.result.path[0].start].lat,
                row.result.nodes[row.result.path[0].start].lon,
            ]);
            let tooltipLayer = L.layerGroup();
            row.result.path.forEach((path) => {
                if (path.method != lastmethod) {
                    L.polyline(latlngs, {
                        color: this.getcolor(lastmethod),
                    }).addTo(routeLayer);
                    lastmethod = path.method;
                    latlngs = [];
                    latlngs.push([
                        row.result.nodes[path.start].lat,
                        row.result.nodes[path.start].lon,
                    ]);
                }
                latlngs.push([
                    row.result.nodes[path.end].lat,
                    row.result.nodes[path.end].lon,
                ]);
                if (path.name) {
                    if (path.name != lastRoadName) {
                        lastRoadName = path.name;
                        let tooltip = L.tooltip({
                            permanent: true,
                            direction: "center",
                            className: "tooltip",
                            offset: [0, 0],
                            opacity: 0.8,
                            sticky: true,
                        })
                            .setContent(path.name)
                            .setLatLng([
                                row.result.nodes[path.start].lat,
                                row.result.nodes[path.start].lon,
                            ]);
                        tooltipLayer.addLayer(tooltip);
                    }
                }
            });
            L.polyline(latlngs, {
                color: this.getcolor(lastmethod),
            }).addTo(routeLayer);
            if (this.routeshowlayer != null) {
                this.map.removeLayer(this.routeshowlayer);
            }
            if (this.tooltipLayer != null) {
                this.map.removeLayer(this.tooltipLayer);
            }
            this.routeshowlayer = routeLayer.addTo(this.map);
            this.tooltipLayer = tooltipLayer.addTo(this.map);
            this.map.fitBounds(this.routeshowlayer.getBounds());
        },
        route_all() {
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
                fetch(
                    "http://local.tmysam.top:11222/find_path?start=" +
                        task.start +
                        "&end=" +
                        task.end +
                        "&method=" +
                        methods
                )
                    .then((response) => response.json())
                    .then((data) => {
                        task.result = data;
                        task.status = "完成";
                        this.taskFinished += 1;
                    });
            });
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

            fetch(
                "https://restapi.amap.com/v5/place/text?key=&keywords=" +
                    addr_input +
                    "&region=310000&city_limit=true"
            )
                .then((response) => response.json())
                .then((data) => {
                    this.searching = false;
                    this.search_result = data.pois;
                    //local storage
                    localStorage.setItem(
                        "search_result",
                        JSON.stringify(data.pois)
                    );
                });
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
            this.update_location(this.points.length - 1);
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
                "http://local.tmysam.top:11222/find_nearest_node?lat=" +
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
            fetch(
                "https://restapi.amap.com/v3/geocode/regeo?key=&location=" +
                    _point.selected_lon.toFixed(6) +
                    "," +
                    _point.selected_lat.toFixed(6) +
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
    },
    mounted() {
        //document.addEventListener("mousemove", this.handleMouseMove);
        var workPool = WorkDistribution({
            concurrency: navigator.hardwareConcurrency,
            src: "worker.js",
        });

        this.map = L.map("map", {
            maxZoom: options.depth,
            attributionControl: false,
        }).setView(options.center, 13);
        var AttrControl = L.control.attribution().addTo(this.map);
        //AttrControl.setPrefix('<a href="https://leafletjs.com/">Leaflet</a>');
        AttrControl.setPrefix("");
        L.TileLayer.Fractal = L.TileLayer.extend({
            initialize: function () {
                this.on("tileunload", (e) => e.tile.cancel());
            },
            setType: function (value) {
                this._type = value;
            },
            getAttribution: function () {
                return "<a href='https://www.tmysam.top/' target='_blank'>TSStudio GIS</a>";
            },
            createTile: function (coords, done) {
                const tile = document.createElement("img");
                L.DomEvent.on(
                    tile,
                    "load",
                    L.Util.bind(this._tileOnLoad, this, done, tile)
                );
                L.DomEvent.on(
                    tile,
                    "error",
                    L.Util.bind(this._tileOnError, this, done, tile)
                );
                tile.setAttribute("role", "presentation");
                tile.cancel = workPool.push(
                    {
                        coords: coords,
                        id: tile.id,
                        type: "basic",
                    },
                    (e) => {
                        const canvas = document.createElement("canvas");
                        canvas.height = canvas.width = options.tileSize;

                        const ctx = canvas.getContext("2d");
                        ctx.putImageData(e.data.imageData, 0, 0);

                        tile.src = canvas.toDataURL();
                    }
                );
                return tile;
            },
        });
        L.TileLayer.FractalOverlay = L.TileLayer.extend({
            initialize: function () {
                this.on("tileunload", (e) => e.tile.cancel());
            },
            setType: function (value) {
                this._type = value;
            },
            getAttribution: function () {
                return "<a href='https://www.tmysam.top/' target='_blank'>TSStudio GIS</a>";
            },
            createTile: function (coords, done) {
                const tile = document.createElement("img");
                L.DomEvent.on(
                    tile,
                    "load",
                    L.Util.bind(this._tileOnLoad, this, done, tile)
                );
                L.DomEvent.on(
                    tile,
                    "error",
                    L.Util.bind(this._tileOnError, this, done, tile)
                );
                tile.setAttribute("role", "presentation");
                tile.cancel = workPool.push(
                    {
                        coords: coords,
                        id: tile.id,
                        type: "basic-overlay",
                    },
                    (e) => {
                        const canvas = document.createElement("canvas");
                        canvas.height = canvas.width = options.tileSize;

                        const ctx = canvas.getContext("2d");
                        ctx.putImageData(e.data.imageData, 0, 0);

                        tile.src = canvas.toDataURL();
                    }
                );
                return tile;
            },
        });
        L.tileLayer.path = () => {
            var layer = new L.TileLayer.Fractal();
            layer.setType("mandlebrot");
            return layer;
        };
        L.tileLayer.overlaypath = () => {
            var layer = new L.TileLayer.FractalOverlay();
            layer.setType("mandlebrot");
            return layer;
        };
        const path = L.tileLayer.path();
        const overlaypath = L.tileLayer.overlaypath();
        const satellite_layer = L.tileLayer(
            "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
            {
                maxZoom: 19,
                attribution:
                    '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
            }
        );

        const hybrid = L.layerGroup([satellite_layer, overlaypath]);
        var layers = {
            地图: path,
            卫星: satellite_layer,
            混合: hybrid,
        };
        const layerControl = L.control.layers(layers).addTo(toRaw(this.map));
        hybrid.addTo(toRaw(this.map));

        this.map.on("click", (e) => {
            this.mouse_lat_c = e.latlng.lat;
            this.mouse_lon_c = e.latlng.lng;
            this.get_nearest_node(e.latlng.lat, e.latlng.lng);
        });
        this.map.on("mousemove", (e) => {
            this.mouse_lat = e.latlng.lat;
            this.mouse_lon = e.latlng.lng;
        });
        this.map.on("zoomend", (e) => {
            this.zoomlevel = this.map.getZoom();
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
    },
};
</script>
