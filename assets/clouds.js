// Based on https://github.com/spite/CSS3DClouds

export default class Clouds {
    constructor(el) {
        this.viewport = document.querySelector(el);
        if (!this.viewport) return;
        this.viewport.style.perspective = 400;
        this.world = document.createElement('div');
        this.world.id = 'world';
        this.viewport.appendChild(this.world);
        this.logo = document.createElement('div');
        this.logo.id = 'logo';
        this.logo.className = 'center fatter';
        this.logo.textContent = 'nimbi';
        this.world.appendChild(this.logo);
        this.textures = [
            { file: './assets/cloud.png', opacity: 1, weight: 0.7 },
            { file: './assets/darkCloud.png', opacity: 1, weight: 1 }
        ];
        this.layers = [];
        this.objects = [];
        this.computedWeights = [];
        this.worldXAngle = 0;
        this.worldYAngle = 0;
        this.d = 0;
        this.f = 0;

        this.viewport.addEventListener('mousewheel', this.onContainerMouseWheel);
        this.viewport.addEventListener('DOMMouseScroll', this.onContainerMouseWheel);
        //this.viewport.addEventListener( 'deviceorientation', orientationhandler, false );
        //this.viewport.addEventListener( 'MozOrientation', orientationhandler, false );
        this.viewport.addEventListener('mousemove', this.onMouseMove);
        this.viewport.addEventListener('touchmove', this.onTouchMove);

        this.viewport.addEventListener('contextmenu', event => event.preventDefault());
        this.viewport.addEventListener('DOMContentLoaded', this.init);

        //this.viewport.onMouseMove = onMouseMove;

    }

    safeRandom = () => {
        if (!!window.crypto) {
            return window.crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000;
        } else {
            const
                d = Date.now(),
                r = Math.pow(10, d.toString().length),
                sf = (d + Math.random() * r) % r;
            return sf / r;
        }
    }

    createCloud = () => {
        const
            div = document.createElement('div');
        let
            [x, y, z] = [256 - this.safeRandom() * 512, 256 - this.safeRandom() * 512, 256 - this.safeRandom() * 512],
            a = this.safeRandom() * 360,
            s = 0.25 + this.safeRandom();
        div.className = 'cloudBase';
        div.style.transform = `translateX(${x}px) translateY(${y}px) translateZ(${z}px)`;
        for (let j = 0; j < 5 + Math.round(this.safeRandom() * 10); j++) {
            const
                cloud = document.createElement('img'),
                r = this.safeRandom();
            let src = '/assets/darkCloud.png';
            this.computedWeights.forEach(w => {
                if (r >= w.min && r <= w.max) src = w.src;
            });
            x = 256 - this.safeRandom() * 512;
            y = 256 - this.safeRandom() * 512;
            z = 100 - this.safeRandom() * 200;
            a = this.safeRandom() * 360;
            s = this.safeRandom() + 0.25;
            x *= 0.2;
            y *= 0.2;
            cloud.data = {
                x: x,
                y: y,
                z: z,
                a: a,
                s: s,
                speed: this.safeRandom() * -0.025
            };
            cloud.setAttribute('src', src);
            cloud.className = 'cloudLayer';
            cloud.style.transform = `translateX(${x}px) translateY(${y}px) translateZ(${z}px) rotateZ(${a}deg) scale(${s})`;
            div.appendChild(cloud);
            this.layers.push(cloud);
        }
        this.world.appendChild(div);
        return div;
    }

    generate = () => {
        const total = this.textures.reduce((acc, t) => acc + t.weight, 0);
        let accum = 0;
        this.objects = [];
        this.computedWeights = [];
        this.textures.forEach(t => {
            let w = t.weight / total;
            this.computedWeights.push({
                'src': t.file,
                'min': accum,
                'max': accum + w,
            });
            accum += w;
        });
        for (let j = 0; j < 5 + Math.round(this.safeRandom() * 3); j++) {
            this.objects.push(this.createCloud());
        }
    }

    updateView = () => {
        this.logo.style.transform = `rotateY(${-this.worldYAngle}deg) rotateX(${-this.worldXAngle}deg)`;
        this.world.style.transform = `translateZ(${this.d}px) rotateX(${this.worldXAngle}deg) rotateY(${this.worldYAngle}deg)`;
        if (this.f === 0) {
            this.f = 1;
            this.layers.forEach(l => {
                l.style.opacity = 0.8;
            });
        }
    }

    onMouseMove = e => {
        this.worldYAngle = -(0.5 - e.clientX / window.innerWidth) * 180;
        this.worldXAngle = (0.5 - e.clientY / window.innerHeight) * 180;
        this.updateView();
    }

    onTouchMove = e => {
        let ptr = e.changedTouches.length;
        while (ptr--) {
            const touch = e.changedTouches[ptr];
            this.worldYAngle = -(0.5 - touch.pageX / window.innerWidth) * 180;
            this.worldXAngle = (0.5 - touch.pageY / window.innerHeight) * 180;
            this.updateView();
        }
        e.preventDefault();
    }

    onContainerMouseWheel = e => {
        this.d += e.detail ? e.detail * -5 : e.wheelDelta / 8;
        this.d = Math.min(Math.max(this.d, -200), 500);
        this.updateView();
    }

    orientationhandler = e => {
        this.worldXAngle = e.gamma || -(e.x * (180 / Math.PI));
        this.worldYAngle = e.beta || -(e.y * (180 / Math.PI));
        this.updateView();
    }

    update = () => {
        this.layers.forEach(l => {
            l.data.a += l.data.speed;
            l.style.transform = `translateX(${l.data.x}px) translateY(${l.data.y}px) translateZ(${l.data.z}px) 
                rotateY(${-this.worldYAngle}deg) rotateX(${-this.worldXAngle}deg) rotateZ(${l.data.a}deg) 
                scale(${l.data.s})`;
            //if (l.data.z < 0) l.style.filter = 'blur(1px)';
        });
        requestAnimationFrame(this.update);
    }

    init = () => {
        if (!this.viewport) return;
        this.generate();
        this.update();
    }
}