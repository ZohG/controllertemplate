let controller_image_container = document.getElementById("controller_image_container");
let draggable_text_container = document.getElementById("draggable_text_container");


let globalLeaderLinesContainer = [];
let globalSnapTargetsContainer = [];

let right_bumper_controls = [
    {name: "r1", icon:"rb.png", x: 65, y: 18, socket: 'top'},
    {name: "r2", icon:"rt.png", x: 68, y: 20, socket: 'top'}
]

let right_face_controls = [
    {name: "Y", icon:"y.png", x: 69, y: 31, socket: 'right'},
    {name: "B", icon:"b.png", x: 73, y: 36, socket: 'right'},
    {name: "A", icon:"a.png", x: 69, y: 43, socket: 'right'},      
    {name: "X", icon:"x.png", x: 61, y: 41, socket: 'bottom'},  
];

let right_stick_controls = [
    {name: "R-Stick", icon:"right_stick.png", x: 59, y: 56, socket: 'bottom'},
    {name: "R3", icon:"r3.png", x: 56, y: 56, socket: 'bottom'}
]

let left_bumper_controls = [
    {name: "l1", icon:"lb.png", x: 35, y: 18, socket: 'top'},
    {name: "r2", icon:"lt.png", x: 32, y: 20, socket: 'top'}
];

let left_stick_controls = [
    {name: "L-Stick", icon:"left_stick.png", x: 29, y: 35, socket: 'left'},
    {name: "L3", icon:"l3.png", x: 29, y: 38, socket: 'left'}
]

let left_arrow_controls = [
    {name: "Up", icon:"dpad_up.png", x: 38, y: 44, socket: 'left'},
    {name: "Left", icon:"dpad_left.png", x: 36, y: 49, socket: 'left'},
    {name: "Down", icon:"dpad_down.png", x: 37, y: 55, socket: 'left'},      
    {name: "Right", icon:"dpad_right.png", x: 46, y: 55, socket: 'bottom'},  
]

let select_controls = [
    {name: "Select",  icon:"view.png", x: 46, y: 32, socket: 'top'}
]

let start_controls = [
    {name: "Start", icon:"menu.png", x: 54, y: 32, socket: 'top'}
]

function generateLeaderLines(controls_array, list_id, end_socket, end_point_anchor) {

    let list = document.getElementById(list_id);
    
    for (const point of controls_array) {
        let drag_target = document.createElement("div");
        drag_target.classList.add("drag_target");
        list.appendChild(drag_target);

        if('icon' in point) {
            let icon = document.createElement("div");
            icon.classList.add("icon");
            icon.style.backgroundImage = "url('../static/icons/" + point.icon + "')";
            drag_target.appendChild(icon);
        }

        let snap_target = document.createElement("div");
        snap_target.classList.add("snap_target");
        drag_target.appendChild(snap_target);

        globalSnapTargetsContainer.push(snap_target);

        let image_point = document.createElement("div");
        image_point.classList.add("image_point");
        image_point.style.left = point.x + "%";
        image_point.style.top = point.y + "%";
        controller_image_container.appendChild(image_point);

        let extra_points = [];

        if('path' in point) {
            console.log(point.name);
            for(let i = 0; i < point.path.length; i++) {
                extra_points[i] = document.createElement("div");
                extra_points[i].classList.add("image_point");
                extra_points[i].style.left = point.path[i].x + "%";
                extra_points[i].style.top = point.path[i].y + "%";

                controller_image_container.appendChild(extra_points[i]);

                let start_point = i == 0 ? image_point : extra_points[i - 1];
                let subline = new LeaderLine(
                    start_point,
                    extra_points[i]
                )
                subline.startPlug = i == 0 ? 'disc' : 'behind';
                subline.endPlug = 'behind';
                subline.path = 'straight';

                globalLeaderLinesContainer.push(subline);
            }
            
            let final_line = (typeof end_point_anchor === 'undefined') ? new LeaderLine(
                extra_points[extra_points.length - 1],
                drag_target
            ): new LeaderLine(
                extra_points[extra_points.length - 1],
                LeaderLine.pointAnchor(drag_target, end_point_anchor)
            );
            final_line.path = 'grid';
            final_line.startPlug = 'behind';
            final_line.endPlug = 'disc';
            final_line.setOptions({startSocket: point.socket, endSocket: end_socket});

            globalLeaderLinesContainer.push(final_line);
        }

        else{

            var line = (typeof end_point_anchor === 'undefined') ? new LeaderLine(
                image_point,
                drag_target
            ): new LeaderLine(
                image_point,
                LeaderLine.pointAnchor(drag_target, end_point_anchor)
            );
            line.path = 'grid';
            line.startPlug = 'disc';
            line.endPlug = 'disc';
            line.setOptions({startSocket: point.socket, endSocket: end_socket});

            globalLeaderLinesContainer.push(line);
        }
    }
}

generateLeaderLines(select_controls, "top_list_1", "bottom", {x: "90%", y:"100%"});
generateLeaderLines(start_controls, "top_list_2", "bottom", {x: "10%", y:"100%"});

generateLeaderLines(left_bumper_controls, "left_bumper_list", "right");
generateLeaderLines(left_stick_controls, "left_stick_list", "right");
generateLeaderLines(left_arrow_controls, "left_arrow_list", "right");

generateLeaderLines(right_bumper_controls, "right_bumper_list", "left");
generateLeaderLines(right_face_controls, "right_face_list", "left");
generateLeaderLines(right_stick_controls, "right_stick_list", "left");

window.addEventListener('resize', () => {
    for(line of globalLeaderLinesContainer) {
        line.position();
    }
})

//Dragging

let mechanics = ["Ability 1", "Ability 2", "Ability 3", "Consumable 1", "Consumable 2", "Consumable 3", "Jump", "Crouch", "Shoot", "Zoom", "Sprint", "Movement", "Aiming",
                "Reload", "Primary Weapon", "Secondary Weapon", "Melee Weapon", "Previous Weapon", "Next Weapon", "Interact", "Inventory", "Map", "Menu" ];

function checkSnap(newPosition) {
    for(let target of globalSnapTargetsContainer) {
        let rect = target.getBoundingClientRect();
        let distanceA = Math.abs(newPosition.left - rect.left);
        let distanceB = Math.abs(newPosition.top - rect.top);
        
        if(distanceA < 1 && distanceB < 1) {
            return
        }
    }

    this.left = parseInt(this.element.dataset.initialX);
    this.top = parseInt(this.element.dataset.initialY);
}

for(let i = 0; i < mechanics.length; i++) {
    el = document.createElement("div");
    el.classList.add("draggable_text");
    el.textContent = mechanics[i];
    el.style.top = (3 * (i % 5)) + "rem";
    el.style.left = (17 * Math.floor(i / 5) + "rem");
    draggable_text_container.appendChild(el);
    let draggable = new PlainDraggable(el);

    draggable.snap = {
        targets: globalSnapTargetsContainer,
        edge: 'inside'
    };

    draggable.containment = {left: 0, top: 0, width: '100%', height: '100%'};

    draggable.onDragEnd = checkSnap;

    el.dataset.initialX = el.getBoundingClientRect().left;
    el.dataset.initialY = el.getBoundingClientRect().top;
}