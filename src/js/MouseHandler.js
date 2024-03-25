class MouseHandler {
    i = 0;
    constructor(marker) {
        this.marker = marker;
    }

    mouseoverFunc(event) {
        let elem = event.target;
        marker.markPossibleElem(elem);
    }

    mouseclickFunc(event) {
        console.log("MOUSECLIKC FUNC");
        event.preventDefault();
        console.log("event.target = " + event.target);
        console.log("this = " + this);
        let elem = event.target;
        marker.markTrainElem(elem);
    }

    mouseoutFunc(event) {
        let elem = event.target;
        marker.delMarkPossibleElem(elem);
    }

    start() {
        // const elems = document.body.querySelectorAll("*");
        // for (let elem of elems) {
        //     document.addEventListener('mouseover', this.mouseoverFunc);
        //     document.addEventListener('click', this.mouseclickFunc);
        //     document.addEventListener('mouseout', this.mouseoutFunc);
        // }
        document.addEventListener('mouseover', this.mouseoverFunc);
        document.addEventListener('click', this.mouseclickFunc);
        document.addEventListener('mouseout', this.mouseoutFunc);
    }

    stop() {
        document.removeEventListener("mouseover", this.mouseoverFunc);
        document.removeEventListener('click', this.mouseclickFunc);
        document.removeEventListener('mouseout', this.mouseoutFunc);
        marker.clearMarks();
    }
}
