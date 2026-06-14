import { dia, shapes, g, elementTools } from "@joint/core";

export class ShapeFactory {
    createRectangle() {
        const rect = new shapes.standard.Rectangle();
        rect.resize(50, 30);
        rect.position(100, 100);
        rect.attr("root/tabindex", 1);
        rect.attr("root/title", "shapes.standard.Rectangle");
        // rect.attr("label/text", "Rectangle");
        rect.attr("body/fill", "#ffffff");
        rect.attr("body/fillOpacity", 0.7);
        return rect;
    }

    createCircle() {
        const circle = new shapes.standard.Circle();
        circle.resize(50, 50);
        circle.position(150, 150);
        circle.attr("root/tabindex", 2);
        circle.attr("root/title", "shapes.standard.Circle");
        // circle.attr("label/text", "Circle");
        circle.attr("body/fill", "#ffffff");
        circle.attr("body/fillOpacity", 0.7);
        return circle;
    }

    createEllipse() {
        const ellipse = new shapes.standard.Ellipse();
        ellipse.resize(60, 40);
        ellipse.position(200, 200);
        ellipse.attr("root/tabindex", 3);
        ellipse.attr("root/title", "shapes.standard.Ellipse");
        // ellipse.attr("label/text", "Ellipse");
        ellipse.attr("body/fill", "#ffffff");
        ellipse.attr("body/fillOpacity", 0.7);
        return ellipse;
    }

    createPath() {
        const path = new shapes.standard.Path();
        path.resize(150, 150);
        path.position(250, 250);
        path.attr("root/tabindex", 4);
        path.attr("root/title", "shapes.standard.Path");
        // path.attr("label/text", "Path");
        path.attr("body/fill", "#ffffff");
        path.attr("body/fillOpacity", 0.7);
        path.attr("body/refD", "M 0 5 10 0 C 20 0 20 20 10 20 L 0 15 Z");
        return path;
    }

    createPolygon() {
        const polygon = new shapes.standard.Polygon();
        polygon.resize(50, 50);
        polygon.position(300, 300);
        polygon.attr("root/tabindex", 5);
        polygon.attr("root/title", "shapes.standard.Polygon");
        // polygon.attr("label/text", "Polygon");
        polygon.attr("body/fill", "#ffffff");
        polygon.attr("body/fillOpacity", 0.7);
        polygon.attr("body/refPoints", "0,10 10,0 20,10 10,20");
        return polygon;
    }

    createPolyline() {
        const polyline = new shapes.standard.Polyline();
        polyline.resize(100, 100);
        polyline.position(345, 160);
        polyline.attr("root/tabindex", 6);
        polyline.attr("root/title", "shapes.standard.Polyline");
        // polyline.attr("label/text", "Polyline");
        polyline.attr("body/fill", "#FFFFFF");
        polyline.attr("body/fillOpacity", 0.7);
        polyline.attr("body/refPoints", "0,0 0,10 10,10 10,0");
        return polyline;
    }

    createCylinder() {
        const cylinder = new shapes.standard.Cylinder();
        cylinder.resize(50, 70);
        cylinder.position(400, 350);
        cylinder.attr("root/tabindex", 7);
        cylinder.attr("root/title", "shapes.standard.Cylinder");
        // cylinder.attr("label/text", "Cylinder");
        cylinder.attr("body/fill", "#ffffff");
        cylinder.attr("body/fillOpacity", 0.7);
        return cylinder;
    }

    createHeaderedRectangle() {
        const headeredRectangle = new shapes.standard.HeaderedRectangle();
        headeredRectangle.resize(150, 100);
        headeredRectangle.position(20, 470);
        headeredRectangle.attr("root/tabindex", 12);
        headeredRectangle.attr("root/title", "shapes.standard.HeaderedRectangle");
        headeredRectangle.attr("body/fill", "#ffffff");
        headeredRectangle.attr("header/fillOpacity", 0.1);
        // headeredRectangle.attr("headerText/text", "Header");
        headeredRectangle.attr("body/fill", "#ffffff");
        headeredRectangle.attr("body/fillOpacity", 0.7);
        // headeredRectangle.attr("bodyText/text", "Headered\nRectangle");

        return headeredRectangle;
    }
}
