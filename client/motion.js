!(function (t, e) {
    "object" == typeof exports && "undefined" != typeof module
        ? e(exports)
        : "function" == typeof define && define.amd
        ? define(["exports"], e)
        : e(
              ((t =
                  "undefined" != typeof globalThis
                      ? globalThis
                      : t || self).Motion = {})
          );
})(this, function (t) {
    "use strict";
    const e = (t) => t;
    let n = e;
    function s(t, e, n) {
        var s;
        if (t instanceof Element) return [t];
        if ("string" == typeof t) {
            let i = document;
            e && (i = e.current);
            const r =
                null !== (s = null == n ? void 0 : n[t]) && void 0 !== s
                    ? s
                    : i.querySelectorAll(t);
            return r ? Array.from(r) : [];
        }
        return Array.from(t);
    }
    const i = !1;
    function r(t, e) {
        const n = t.indexOf(e);
        n > -1 && t.splice(n, 1);
    }
    class o {
        constructor() {
            this.subscriptions = [];
        }
        add(t) {
            var e, n;
            return (
                (e = this.subscriptions),
                (n = t),
                -1 === e.indexOf(n) && e.push(n),
                () => r(this.subscriptions, t)
            );
        }
        notify(t, e, n) {
            const s = this.subscriptions.length;
            if (s)
                if (1 === s) this.subscriptions[0](t, e, n);
                else
                    for (let i = 0; i < s; i++) {
                        const s = this.subscriptions[i];
                        s && s(t, e, n);
                    }
        }
        getSize() {
            return this.subscriptions.length;
        }
        clear() {
            this.subscriptions.length = 0;
        }
    }
    function a(t, e) {
        return e ? t * (1e3 / e) : 0;
    }
    const l = !1;
    const u = [
        "read",
        "resolveKeyframes",
        "update",
        "preRender",
        "render",
        "postRender",
    ];
    const {
        schedule: c,
        cancel: h,
        state: d,
        steps: p,
    } = (function (t, e) {
        let n = !1,
            s = !0;
        const i = { delta: 0, timestamp: 0, isProcessing: !1 },
            r = () => (n = !0),
            o = u.reduce(
                (t, e) => (
                    (t[e] = (function (t) {
                        let e = new Set(),
                            n = new Set(),
                            s = !1,
                            i = !1;
                        const r = new WeakSet();
                        let o = { delta: 0, timestamp: 0, isProcessing: !1 };
                        function a(e) {
                            r.has(e) && (l.schedule(e), t()), e(o);
                        }
                        const l = {
                            schedule: (t, i = !1, o = !1) => {
                                const a = o && s ? e : n;
                                return i && r.add(t), a.has(t) || a.add(t), t;
                            },
                            cancel: (t) => {
                                n.delete(t), r.delete(t);
                            },
                            process: (t) => {
                                (o = t),
                                    s
                                        ? (i = !0)
                                        : ((s = !0),
                                          ([e, n] = [n, e]),
                                          n.clear(),
                                          e.forEach(a),
                                          (s = !1),
                                          i && ((i = !1), l.process(t)));
                            },
                        };
                        return l;
                    })(r)),
                    t
                ),
                {}
            ),
            {
                read: a,
                resolveKeyframes: l,
                update: c,
                preRender: h,
                render: d,
                postRender: p,
            } = o,
            f = () => {
                const r = performance.now();
                (n = !1),
                    (i.delta = s
                        ? 1e3 / 60
                        : Math.max(Math.min(r - i.timestamp, 40), 1)),
                    (i.timestamp = r),
                    (i.isProcessing = !0),
                    a.process(i),
                    l.process(i),
                    c.process(i),
                    h.process(i),
                    d.process(i),
                    p.process(i),
                    (i.isProcessing = !1),
                    n && e && ((s = !1), t(f));
            };
        return {
            schedule: u.reduce((e, r) => {
                const a = o[r];
                return (
                    (e[r] = (e, r = !1, o = !1) => (
                        n || ((n = !0), (s = !0), i.isProcessing || t(f)),
                        a.schedule(e, r, o)
                    )),
                    e
                );
            }, {}),
            cancel: (t) => {
                for (let e = 0; e < u.length; e++) o[u[e]].cancel(t);
            },
            state: i,
            steps: o,
        };
    })(
        "undefined" != typeof requestAnimationFrame ? requestAnimationFrame : e,
        !0
    );
    let f;
    function m() {
        f = void 0;
    }
    const g = {
        now: () => (
            void 0 === f &&
                g.set(d.isProcessing || l ? d.timestamp : performance.now()),
            f
        ),
        set: (t) => {
            (f = t), queueMicrotask(m);
        },
    };
    class y {
        constructor(t, e = {}) {
            (this.version = "11.13.5"),
                (this.canTrackVelocity = null),
                (this.events = {}),
                (this.updateAndNotify = (t, e = !0) => {
                    const n = g.now();
                    this.updatedAt !== n && this.setPrevFrameValue(),
                        (this.prev = this.current),
                        this.setCurrent(t),
                        this.current !== this.prev &&
                            this.events.change &&
                            this.events.change.notify(this.current),
                        e &&
                            this.events.renderRequest &&
                            this.events.renderRequest.notify(this.current);
                }),
                (this.hasAnimated = !1),
                this.setCurrent(t),
                (this.owner = e.owner);
        }
        setCurrent(t) {
            var e;
            (this.current = t),
                (this.updatedAt = g.now()),
                null === this.canTrackVelocity &&
                    void 0 !== t &&
                    (this.canTrackVelocity =
                        ((e = this.current), !isNaN(parseFloat(e))));
        }
        setPrevFrameValue(t = this.current) {
            (this.prevFrameValue = t), (this.prevUpdatedAt = this.updatedAt);
        }
        onChange(t) {
            return this.on("change", t);
        }
        on(t, e) {
            this.events[t] || (this.events[t] = new o());
            const n = this.events[t].add(e);
            return "change" === t
                ? () => {
                      n(),
                          c.read(() => {
                              this.events.change.getSize() || this.stop();
                          });
                  }
                : n;
        }
        clearListeners() {
            for (const t in this.events) this.events[t].clear();
        }
        attach(t, e) {
            (this.passiveEffect = t), (this.stopPassiveEffect = e);
        }
        set(t, e = !0) {
            e && this.passiveEffect
                ? this.passiveEffect(t, this.updateAndNotify)
                : this.updateAndNotify(t, e);
        }
        setWithVelocity(t, e, n) {
            this.set(e),
                (this.prev = void 0),
                (this.prevFrameValue = t),
                (this.prevUpdatedAt = this.updatedAt - n);
        }
        jump(t, e = !0) {
            this.updateAndNotify(t),
                (this.prev = t),
                (this.prevUpdatedAt = this.prevFrameValue = void 0),
                e && this.stop(),
                this.stopPassiveEffect && this.stopPassiveEffect();
        }
        get() {
            return this.current;
        }
        getPrevious() {
            return this.prev;
        }
        getVelocity() {
            const t = g.now();
            if (
                !this.canTrackVelocity ||
                void 0 === this.prevFrameValue ||
                t - this.updatedAt > 30
            )
                return 0;
            const e = Math.min(this.updatedAt - this.prevUpdatedAt, 30);
            return a(
                parseFloat(this.current) - parseFloat(this.prevFrameValue),
                e
            );
        }
        start(t) {
            return (
                this.stop(),
                new Promise((e) => {
                    (this.hasAnimated = !0),
                        (this.animation = t(e)),
                        this.events.animationStart &&
                            this.events.animationStart.notify();
                }).then(() => {
                    this.events.animationComplete &&
                        this.events.animationComplete.notify(),
                        this.clearAnimation();
                })
            );
        }
        stop() {
            this.animation &&
                (this.animation.stop(),
                this.events.animationCancel &&
                    this.events.animationCancel.notify()),
                this.clearAnimation();
        }
        isAnimating() {
            return !!this.animation;
        }
        clearAnimation() {
            delete this.animation;
        }
        destroy() {
            this.clearListeners(),
                this.stop(),
                this.stopPassiveEffect && this.stopPassiveEffect();
        }
    }
    function v(t, e) {
        return new y(t, e);
    }
    function w(t) {
        let e;
        return () => (void 0 === e && (e = t()), e);
    }
    const b = w(() => void 0 !== window.ScrollTimeline);
    class x {
        constructor(t) {
            (this.stop = () => this.runAll("stop")),
                (this.animations = t.filter(Boolean));
        }
        then(t, e) {
            return Promise.all(this.animations).then(t).catch(e);
        }
        getAll(t) {
            return this.animations[0][t];
        }
        setAll(t, e) {
            for (let n = 0; n < this.animations.length; n++)
                this.animations[n][t] = e;
        }
        attachTimeline(t, e) {
            const n = this.animations.map((n) =>
                b() && n.attachTimeline ? n.attachTimeline(t) : e(n)
            );
            return () => {
                n.forEach((t, e) => {
                    t && t(), this.animations[e].stop();
                });
            };
        }
        get time() {
            return this.getAll("time");
        }
        set time(t) {
            this.setAll("time", t);
        }
        get speed() {
            return this.getAll("speed");
        }
        set speed(t) {
            this.setAll("speed", t);
        }
        get startTime() {
            return this.getAll("startTime");
        }
        get duration() {
            let t = 0;
            for (let e = 0; e < this.animations.length; e++)
                t = Math.max(t, this.animations[e].duration);
            return t;
        }
        runAll(t) {
            this.animations.forEach((e) => e[t]());
        }
        flatten() {
            this.runAll("flatten");
        }
        play() {
            this.runAll("play");
        }
        pause() {
            this.runAll("pause");
        }
        cancel() {
            this.runAll("cancel");
        }
        complete() {
            this.runAll("complete");
        }
    }
    const T = (t, e, n) => {
            const s = e - t;
            return 0 === s ? 1 : (n - t) / s;
        },
        S = (t, e, n = 10) => {
            let s = "";
            const i = Math.max(Math.round(e / n), 2);
            for (let e = 0; e < i; e++) s += t(T(0, i - 1, e)) + ", ";
            return `linear(${s.substring(0, s.length - 2)})`;
        },
        V = (t) => 1e3 * t,
        A = (t) => t / 1e3;
    function M(t, e, n) {
        const s = Math.max(e - 5, 0);
        return a(n - t(s), e - s);
    }
    const P = (t, e, n) => (n > e ? e : n < t ? t : n),
        k = 100,
        F = 10,
        C = 1,
        E = 0,
        O = 800,
        I = 0.3,
        R = 0.3,
        B = { granular: 0.01, default: 2 },
        D = { granular: 0.005, default: 0.5 },
        L = 0.01,
        W = 10,
        N = 0.05,
        K = 1;
    function j({
        duration: t = O,
        bounce: e = I,
        velocity: n = E,
        mass: s = C,
    }) {
        let i,
            r,
            o = 1 - e;
        (o = P(N, K, o)),
            (t = P(L, W, A(t))),
            o < 1
                ? ((i = (e) => {
                      const s = e * o,
                          i = s * t;
                      return 0.001 - ((s - n) / z(e, o)) * Math.exp(-i);
                  }),
                  (r = (e) => {
                      const s = e * o * t,
                          r = s * n + n,
                          a = Math.pow(o, 2) * Math.pow(e, 2) * t,
                          l = Math.exp(-s),
                          u = z(Math.pow(e, 2), o);
                      return ((0.001 - i(e) > 0 ? -1 : 1) * ((r - a) * l)) / u;
                  }))
                : ((i = (e) => Math.exp(-e * t) * ((e - n) * t + 1) - 0.001),
                  (r = (e) => Math.exp(-e * t) * (t * t * (n - e))));
        const a = (function (t, e, n) {
            let s = n;
            for (let n = 1; n < 12; n++) s -= t(s) / e(s);
            return s;
        })(i, r, 5 / t);
        if (((t = V(t)), isNaN(a)))
            return { stiffness: k, damping: F, duration: t };
        {
            const e = Math.pow(a, 2) * s;
            return {
                stiffness: e,
                damping: 2 * o * Math.sqrt(s * e),
                duration: t,
            };
        }
    }
    function z(t, e) {
        return t * Math.sqrt(1 - e * e);
    }
    function $(t) {
        let e = 0;
        let n = t.next(e);
        for (; !n.done && e < 2e4; ) (e += 50), (n = t.next(e));
        return e >= 2e4 ? 1 / 0 : e;
    }
    const H = ["duration", "bounce"],
        U = ["stiffness", "damping", "mass"];
    function Y(t, e) {
        return e.some((e) => void 0 !== t[e]);
    }
    function q(t = R, e = I) {
        const n =
            "object" != typeof t
                ? { visualDuration: t, keyframes: [0, 1], bounce: e }
                : t;
        let { restSpeed: s, restDelta: i } = n;
        const r = n.keyframes[0],
            o = n.keyframes[n.keyframes.length - 1],
            a = { done: !1, value: r },
            {
                stiffness: l,
                damping: u,
                mass: c,
                duration: h,
                velocity: d,
                isResolvedFromDuration: p,
            } = (function (t) {
                let e = {
                    velocity: E,
                    stiffness: k,
                    damping: F,
                    mass: C,
                    isResolvedFromDuration: !1,
                    ...t,
                };
                if (!Y(t, U) && Y(t, H))
                    if (t.visualDuration) {
                        const n = t.visualDuration,
                            s = (2 * Math.PI) / (1.2 * n),
                            i = s * s,
                            r = 2 * P(0.05, 1, 1 - t.bounce) * Math.sqrt(i);
                        e = { ...e, mass: C, stiffness: i, damping: r };
                    } else {
                        const n = j(t);
                        (e = { ...e, ...n, mass: C }),
                            (e.isResolvedFromDuration = !0);
                    }
                return e;
            })({ ...n, velocity: -A(n.velocity || 0) }),
            f = d || 0,
            m = u / (2 * Math.sqrt(l * c)),
            g = o - r,
            y = A(Math.sqrt(l / c)),
            v = Math.abs(g) < 5;
        let w;
        if (
            (s || (s = v ? B.granular : B.default),
            i || (i = v ? D.granular : D.default),
            m < 1)
        ) {
            const t = z(y, m);
            w = (e) => {
                const n = Math.exp(-m * y * e);
                return (
                    o -
                    n *
                        (((f + m * y * g) / t) * Math.sin(t * e) +
                            g * Math.cos(t * e))
                );
            };
        } else if (1 === m)
            w = (t) => o - Math.exp(-y * t) * (g + (f + y * g) * t);
        else {
            const t = y * Math.sqrt(m * m - 1);
            w = (e) => {
                const n = Math.exp(-m * y * e),
                    s = Math.min(t * e, 300);
                return (
                    o -
                    (n *
                        ((f + m * y * g) * Math.sinh(s) +
                            t * g * Math.cosh(s))) /
                        t
                );
            };
        }
        const b = {
            calculatedDuration: (p && h) || null,
            next: (t) => {
                const e = w(t);
                if (p) a.done = t >= h;
                else {
                    let n = 0;
                    m < 1 && (n = 0 === t ? V(f) : M(w, t, e));
                    const r = Math.abs(n) <= s,
                        l = Math.abs(o - e) <= i;
                    a.done = r && l;
                }
                return (a.value = a.done ? o : e), a;
            },
            toString: () => {
                const t = Math.min($(b), 2e4),
                    e = S((e) => b.next(t * e).value, t, 30);
                return t + "ms " + e;
            },
        };
        return b;
    }
    function X(t, e = 100, n) {
        const s = n({ ...t, keyframes: [0, e] }),
            i = Math.min($(s), 2e4);
        return {
            type: "keyframes",
            ease: (t) => s.next(i * t).value / e,
            duration: A(i),
        };
    }
    const G = (t, e, n) => t + (e - t) * n;
    function Z(t, e) {
        const n = t[t.length - 1];
        for (let s = 1; s <= e; s++) {
            const i = T(0, e, s);
            t.push(G(n, 1, i));
        }
    }
    function _(t) {
        const e = [0];
        return Z(e, t.length - 1), e;
    }
    const J = (t) => Boolean(t && t.getVelocity);
    function Q(t) {
        return "object" == typeof t && !Array.isArray(t);
    }
    function tt(t, e, n, i) {
        return "string" == typeof t && Q(e)
            ? s(t, n, i)
            : t instanceof NodeList
            ? Array.from(t)
            : Array.isArray(t)
            ? t
            : [t];
    }
    function et(t) {
        return "function" == typeof t;
    }
    function nt(t, e, n, s) {
        var i;
        return "number" == typeof e
            ? e
            : e.startsWith("-") || e.startsWith("+")
            ? Math.max(0, t + parseFloat(e))
            : "<" === e
            ? n
            : null !== (i = s.get(e)) && void 0 !== i
            ? i
            : t;
    }
    const st = (t, e, n) => {
            const s = e - t;
            return ((((n - t) % s) + s) % s) + t;
        },
        it = (t) => Array.isArray(t) && "number" != typeof t[0];
    function rt(t, e) {
        return it(t) ? t[st(0, t.length, e)] : t;
    }
    function ot(t, e, n, s, i, o) {
        !(function (t, e, n) {
            for (let s = 0; s < t.length; s++) {
                const i = t[s];
                i.at > e && i.at < n && (r(t, i), s--);
            }
        })(t, i, o);
        for (let r = 0; r < e.length; r++)
            t.push({ value: e[r], at: G(i, o, s[r]), easing: rt(n, r) });
    }
    function at(t, e) {
        return t.at === e.at
            ? null === t.value
                ? 1
                : null === e.value
                ? -1
                : 0
            : t.at - e.at;
    }
    function lt(t, e) {
        return !e.has(t) && e.set(t, {}), e.get(t);
    }
    function ut(t, e) {
        return e[t] || (e[t] = []), e[t];
    }
    function ct(t) {
        return Array.isArray(t) ? t : [t];
    }
    function ht(t, e) {
        return t && t[e] ? { ...t, ...t[e] } : { ...t };
    }
    const dt = (t) => "number" == typeof t,
        pt = (t) => t.every(dt),
        ft = new WeakMap(),
        mt = [
            "transformPerspective",
            "x",
            "y",
            "z",
            "translateX",
            "translateY",
            "translateZ",
            "scale",
            "scaleX",
            "scaleY",
            "rotate",
            "rotateX",
            "rotateY",
            "rotateZ",
            "skew",
            "skewX",
            "skewY",
        ],
        gt = new Set(mt),
        yt = { type: "spring", stiffness: 500, damping: 25, restSpeed: 10 },
        vt = { type: "keyframes", duration: 0.8 },
        wt = { type: "keyframes", ease: [0.25, 0.1, 0.35, 1], duration: 0.3 },
        bt = (t, { keyframes: e }) =>
            e.length > 2
                ? vt
                : gt.has(t)
                ? t.startsWith("scale")
                    ? {
                          type: "spring",
                          stiffness: 550,
                          damping: 0 === e[1] ? 2 * Math.sqrt(550) : 30,
                          restSpeed: 10,
                      }
                    : yt
                : wt;
    function xt(t, e) {
        return t ? t[e] || t.default || t : void 0;
    }
    const Tt = (t) => null !== t;
    function St(t, { repeat: e, repeatType: n = "loop" }, s) {
        const i = t.filter(Tt),
            r = e && "loop" !== n && e % 2 == 1 ? 0 : i.length - 1;
        return r && void 0 !== s ? s : i[r];
    }
    const Vt = (t, e, n) =>
        (((1 - 3 * n + 3 * e) * t + (3 * n - 6 * e)) * t + 3 * e) * t;
    function At(t, n, s, i) {
        if (t === n && s === i) return e;
        const r = (e) =>
            (function (t, e, n, s, i) {
                let r,
                    o,
                    a = 0;
                do {
                    (o = e + (n - e) / 2),
                        (r = Vt(o, s, i) - t),
                        r > 0 ? (n = o) : (e = o);
                } while (Math.abs(r) > 1e-7 && ++a < 12);
                return o;
            })(e, 0, 1, t, s);
        return (t) => (0 === t || 1 === t ? t : Vt(r(t), n, i));
    }
    const Mt = (t) => (e) => e <= 0.5 ? t(2 * e) / 2 : (2 - t(2 * (1 - e))) / 2,
        Pt = (t) => (e) => 1 - t(1 - e),
        kt = At(0.33, 1.53, 0.69, 0.99),
        Ft = Pt(kt),
        Ct = Mt(Ft),
        Et = (t) =>
            (t *= 2) < 1 ? 0.5 * Ft(t) : 0.5 * (2 - Math.pow(2, -10 * (t - 1))),
        Ot = (t) => 1 - Math.sin(Math.acos(t)),
        It = Pt(Ot),
        Rt = Mt(Ot),
        Bt = (t) => /^0[^.\s]+$/u.test(t);
    const Dt = (t) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(t),
        Lt = (t) => (e) => "string" == typeof e && e.startsWith(t),
        Wt = Lt("--"),
        Nt = Lt("var(--"),
        Kt = (t) => !!Nt(t) && jt.test(t.split("/*")[0].trim()),
        jt =
            /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu,
        zt = /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;
    function $t(t, e, n = 1) {
        const [s, i] = (function (t) {
            const e = zt.exec(t);
            if (!e) return [,];
            const [, n, s, i] = e;
            return ["--" + (null != n ? n : s), i];
        })(t);
        if (!s) return;
        const r = window.getComputedStyle(e).getPropertyValue(s);
        if (r) {
            const t = r.trim();
            return Dt(t) ? parseFloat(t) : t;
        }
        return Kt(i) ? $t(i, e, n + 1) : i;
    }
    const Ht = {
            test: (t) => "number" == typeof t,
            parse: parseFloat,
            transform: (t) => t,
        },
        Ut = { ...Ht, transform: (t) => P(0, 1, t) },
        Yt = { ...Ht, default: 1 },
        qt = (t) => ({
            test: (e) =>
                "string" == typeof e &&
                e.endsWith(t) &&
                1 === e.split(" ").length,
            parse: parseFloat,
            transform: (e) => `${e}${t}`,
        }),
        Xt = qt("deg"),
        Gt = qt("%"),
        Zt = qt("px"),
        _t = qt("vh"),
        Jt = qt("vw"),
        Qt = {
            ...Gt,
            parse: (t) => Gt.parse(t) / 100,
            transform: (t) => Gt.transform(100 * t),
        },
        te = new Set([
            "width",
            "height",
            "top",
            "left",
            "right",
            "bottom",
            "x",
            "y",
            "translateX",
            "translateY",
        ]),
        ee = (t) => t === Ht || t === Zt,
        ne = (t, e) => parseFloat(t.split(", ")[e]),
        se =
            (t, e) =>
            (n, { transform: s }) => {
                if ("none" === s || !s) return 0;
                const i = s.match(/^matrix3d\((.+)\)$/u);
                if (i) return ne(i[1], e);
                {
                    const e = s.match(/^matrix\((.+)\)$/u);
                    return e ? ne(e[1], t) : 0;
                }
            },
        ie = new Set(["x", "y", "z"]),
        re = mt.filter((t) => !ie.has(t));
    const oe = {
        width: ({ x: t }, { paddingLeft: e = "0", paddingRight: n = "0" }) =>
            t.max - t.min - parseFloat(e) - parseFloat(n),
        height: ({ y: t }, { paddingTop: e = "0", paddingBottom: n = "0" }) =>
            t.max - t.min - parseFloat(e) - parseFloat(n),
        top: (t, { top: e }) => parseFloat(e),
        left: (t, { left: e }) => parseFloat(e),
        bottom: ({ y: t }, { top: e }) => parseFloat(e) + (t.max - t.min),
        right: ({ x: t }, { left: e }) => parseFloat(e) + (t.max - t.min),
        x: se(4, 13),
        y: se(5, 14),
    };
    (oe.translateX = oe.x), (oe.translateY = oe.y);
    const ae = (t) => (e) => e.test(t),
        le = [
            Ht,
            Zt,
            Gt,
            Xt,
            Jt,
            _t,
            { test: (t) => "auto" === t, parse: (t) => t },
        ],
        ue = (t) => le.find(ae(t)),
        ce = new Set();
    let he = !1,
        de = !1;
    function pe() {
        if (de) {
            const t = Array.from(ce).filter((t) => t.needsMeasurement),
                e = new Set(t.map((t) => t.element)),
                n = new Map();
            e.forEach((t) => {
                const e = (function (t) {
                    const e = [];
                    return (
                        re.forEach((n) => {
                            const s = t.getValue(n);
                            void 0 !== s &&
                                (e.push([n, s.get()]),
                                s.set(n.startsWith("scale") ? 1 : 0));
                        }),
                        e
                    );
                })(t);
                e.length && (n.set(t, e), t.render());
            }),
                t.forEach((t) => t.measureInitialState()),
                e.forEach((t) => {
                    t.render();
                    const e = n.get(t);
                    e &&
                        e.forEach(([e, n]) => {
                            var s;
                            null === (s = t.getValue(e)) ||
                                void 0 === s ||
                                s.set(n);
                        });
                }),
                t.forEach((t) => t.measureEndState()),
                t.forEach((t) => {
                    void 0 !== t.suspendedScrollY &&
                        window.scrollTo(0, t.suspendedScrollY);
                });
        }
        (de = !1), (he = !1), ce.forEach((t) => t.complete()), ce.clear();
    }
    function fe() {
        ce.forEach((t) => {
            t.readKeyframes(), t.needsMeasurement && (de = !0);
        });
    }
    class me {
        constructor(t, e, n, s, i, r = !1) {
            (this.isComplete = !1),
                (this.isAsync = !1),
                (this.needsMeasurement = !1),
                (this.isScheduled = !1),
                (this.unresolvedKeyframes = [...t]),
                (this.onComplete = e),
                (this.name = n),
                (this.motionValue = s),
                (this.element = i),
                (this.isAsync = r);
        }
        scheduleResolve() {
            (this.isScheduled = !0),
                this.isAsync
                    ? (ce.add(this),
                      he || ((he = !0), c.read(fe), c.resolveKeyframes(pe)))
                    : (this.readKeyframes(), this.complete());
        }
        readKeyframes() {
            const {
                unresolvedKeyframes: t,
                name: e,
                element: n,
                motionValue: s,
            } = this;
            for (let i = 0; i < t.length; i++)
                if (null === t[i])
                    if (0 === i) {
                        const i = null == s ? void 0 : s.get(),
                            r = t[t.length - 1];
                        if (void 0 !== i) t[0] = i;
                        else if (n && e) {
                            const s = n.readValue(e, r);
                            null != s && (t[0] = s);
                        }
                        void 0 === t[0] && (t[0] = r),
                            s && void 0 === i && s.set(t[0]);
                    } else t[i] = t[i - 1];
        }
        setFinalKeyframe() {}
        measureInitialState() {}
        renderEndStyles() {}
        measureEndState() {}
        complete() {
            (this.isComplete = !0),
                this.onComplete(this.unresolvedKeyframes, this.finalKeyframe),
                ce.delete(this);
        }
        cancel() {
            this.isComplete || ((this.isScheduled = !1), ce.delete(this));
        }
        resume() {
            this.isComplete || this.scheduleResolve();
        }
    }
    const ge = (t) => Math.round(1e5 * t) / 1e5,
        ye = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
    const ve =
            /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu,
        we = (t, e) => (n) =>
            Boolean(
                ("string" == typeof n && ve.test(n) && n.startsWith(t)) ||
                    (e &&
                        !(function (t) {
                            return null == t;
                        })(n) &&
                        Object.prototype.hasOwnProperty.call(n, e))
            ),
        be = (t, e, n) => (s) => {
            if ("string" != typeof s) return s;
            const [i, r, o, a] = s.match(ye);
            return {
                [t]: parseFloat(i),
                [e]: parseFloat(r),
                [n]: parseFloat(o),
                alpha: void 0 !== a ? parseFloat(a) : 1,
            };
        },
        xe = { ...Ht, transform: (t) => Math.round(((t) => P(0, 255, t))(t)) },
        Te = {
            test: we("rgb", "red"),
            parse: be("red", "green", "blue"),
            transform: ({ red: t, green: e, blue: n, alpha: s = 1 }) =>
                "rgba(" +
                xe.transform(t) +
                ", " +
                xe.transform(e) +
                ", " +
                xe.transform(n) +
                ", " +
                ge(Ut.transform(s)) +
                ")",
        };
    const Se = {
            test: we("#"),
            parse: function (t) {
                let e = "",
                    n = "",
                    s = "",
                    i = "";
                return (
                    t.length > 5
                        ? ((e = t.substring(1, 3)),
                          (n = t.substring(3, 5)),
                          (s = t.substring(5, 7)),
                          (i = t.substring(7, 9)))
                        : ((e = t.substring(1, 2)),
                          (n = t.substring(2, 3)),
                          (s = t.substring(3, 4)),
                          (i = t.substring(4, 5)),
                          (e += e),
                          (n += n),
                          (s += s),
                          (i += i)),
                    {
                        red: parseInt(e, 16),
                        green: parseInt(n, 16),
                        blue: parseInt(s, 16),
                        alpha: i ? parseInt(i, 16) / 255 : 1,
                    }
                );
            },
            transform: Te.transform,
        },
        Ve = {
            test: we("hsl", "hue"),
            parse: be("hue", "saturation", "lightness"),
            transform: ({
                hue: t,
                saturation: e,
                lightness: n,
                alpha: s = 1,
            }) =>
                "hsla(" +
                Math.round(t) +
                ", " +
                Gt.transform(ge(e)) +
                ", " +
                Gt.transform(ge(n)) +
                ", " +
                ge(Ut.transform(s)) +
                ")",
        },
        Ae = {
            test: (t) => Te.test(t) || Se.test(t) || Ve.test(t),
            parse: (t) =>
                Te.test(t)
                    ? Te.parse(t)
                    : Ve.test(t)
                    ? Ve.parse(t)
                    : Se.parse(t),
            transform: (t) =>
                "string" == typeof t
                    ? t
                    : t.hasOwnProperty("red")
                    ? Te.transform(t)
                    : Ve.transform(t),
        },
        Me =
            /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
    const Pe =
        /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
    function ke(t) {
        const e = t.toString(),
            n = [],
            s = { color: [], number: [], var: [] },
            i = [];
        let r = 0;
        const o = e
            .replace(
                Pe,
                (t) => (
                    Ae.test(t)
                        ? (s.color.push(r),
                          i.push("color"),
                          n.push(Ae.parse(t)))
                        : t.startsWith("var(")
                        ? (s.var.push(r), i.push("var"), n.push(t))
                        : (s.number.push(r),
                          i.push("number"),
                          n.push(parseFloat(t))),
                    ++r,
                    "${}"
                )
            )
            .split("${}");
        return { values: n, split: o, indexes: s, types: i };
    }
    function Fe(t) {
        return ke(t).values;
    }
    function Ce(t) {
        const { split: e, types: n } = ke(t),
            s = e.length;
        return (t) => {
            let i = "";
            for (let r = 0; r < s; r++)
                if (((i += e[r]), void 0 !== t[r])) {
                    const e = n[r];
                    i +=
                        "number" === e
                            ? ge(t[r])
                            : "color" === e
                            ? Ae.transform(t[r])
                            : t[r];
                }
            return i;
        };
    }
    const Ee = (t) => ("number" == typeof t ? 0 : t);
    const Oe = {
            test: function (t) {
                var e, n;
                return (
                    isNaN(t) &&
                    "string" == typeof t &&
                    ((null === (e = t.match(ye)) || void 0 === e
                        ? void 0
                        : e.length) || 0) +
                        ((null === (n = t.match(Me)) || void 0 === n
                            ? void 0
                            : n.length) || 0) >
                        0
                );
            },
            parse: Fe,
            createTransformer: Ce,
            getAnimatableNone: function (t) {
                const e = Fe(t);
                return Ce(t)(e.map(Ee));
            },
        },
        Ie = new Set(["brightness", "contrast", "saturate", "opacity"]);
    function Re(t) {
        const [e, n] = t.slice(0, -1).split("(");
        if ("drop-shadow" === e) return t;
        const [s] = n.match(ye) || [];
        if (!s) return t;
        const i = n.replace(s, "");
        let r = Ie.has(e) ? 1 : 0;
        return s !== n && (r *= 100), e + "(" + r + i + ")";
    }
    const Be = /\b([a-z-]*)\(.*?\)/gu,
        De = {
            ...Oe,
            getAnimatableNone: (t) => {
                const e = t.match(Be);
                return e ? e.map(Re).join(" ") : t;
            },
        },
        Le = {
            borderWidth: Zt,
            borderTopWidth: Zt,
            borderRightWidth: Zt,
            borderBottomWidth: Zt,
            borderLeftWidth: Zt,
            borderRadius: Zt,
            radius: Zt,
            borderTopLeftRadius: Zt,
            borderTopRightRadius: Zt,
            borderBottomRightRadius: Zt,
            borderBottomLeftRadius: Zt,
            width: Zt,
            maxWidth: Zt,
            height: Zt,
            maxHeight: Zt,
            top: Zt,
            right: Zt,
            bottom: Zt,
            left: Zt,
            padding: Zt,
            paddingTop: Zt,
            paddingRight: Zt,
            paddingBottom: Zt,
            paddingLeft: Zt,
            margin: Zt,
            marginTop: Zt,
            marginRight: Zt,
            marginBottom: Zt,
            marginLeft: Zt,
            backgroundPositionX: Zt,
            backgroundPositionY: Zt,
        },
        We = {
            rotate: Xt,
            rotateX: Xt,
            rotateY: Xt,
            rotateZ: Xt,
            scale: Yt,
            scaleX: Yt,
            scaleY: Yt,
            scaleZ: Yt,
            skew: Xt,
            skewX: Xt,
            skewY: Xt,
            distance: Zt,
            translateX: Zt,
            translateY: Zt,
            translateZ: Zt,
            x: Zt,
            y: Zt,
            z: Zt,
            perspective: Zt,
            transformPerspective: Zt,
            opacity: Ut,
            originX: Qt,
            originY: Qt,
            originZ: Zt,
        },
        Ne = { ...Ht, transform: Math.round },
        Ke = {
            ...Le,
            ...We,
            zIndex: Ne,
            size: Zt,
            fillOpacity: Ut,
            strokeOpacity: Ut,
            numOctaves: Ne,
        },
        je = {
            ...Ke,
            color: Ae,
            backgroundColor: Ae,
            outlineColor: Ae,
            fill: Ae,
            stroke: Ae,
            borderColor: Ae,
            borderTopColor: Ae,
            borderRightColor: Ae,
            borderBottomColor: Ae,
            borderLeftColor: Ae,
            filter: De,
            WebkitFilter: De,
        },
        ze = (t) => je[t];
    function $e(t, e) {
        let n = ze(t);
        return (
            n !== De && (n = Oe),
            n.getAnimatableNone ? n.getAnimatableNone(e) : void 0
        );
    }
    const He = new Set(["auto", "none", "0"]);
    class Ue extends me {
        constructor(t, e, n, s, i) {
            super(t, e, n, s, i, !0);
        }
        readKeyframes() {
            const { unresolvedKeyframes: t, element: e, name: n } = this;
            if (!e || !e.current) return;
            super.readKeyframes();
            for (let n = 0; n < t.length; n++) {
                let s = t[n];
                if ("string" == typeof s && ((s = s.trim()), Kt(s))) {
                    const i = $t(s, e.current);
                    void 0 !== i && (t[n] = i),
                        n === t.length - 1 && (this.finalKeyframe = s);
                }
            }
            if ((this.resolveNoneKeyframes(), !te.has(n) || 2 !== t.length))
                return;
            const [s, i] = t,
                r = ue(s),
                o = ue(i);
            if (r !== o)
                if (ee(r) && ee(o))
                    for (let e = 0; e < t.length; e++) {
                        const n = t[e];
                        "string" == typeof n && (t[e] = parseFloat(n));
                    }
                else this.needsMeasurement = !0;
        }
        resolveNoneKeyframes() {
            const { unresolvedKeyframes: t, name: e } = this,
                n = [];
            for (let e = 0; e < t.length; e++)
                ("number" == typeof (s = t[e])
                    ? 0 === s
                    : null === s || "none" === s || "0" === s || Bt(s)) &&
                    n.push(e);
            var s;
            n.length &&
                (function (t, e, n) {
                    let s = 0,
                        i = void 0;
                    for (; s < t.length && !i; ) {
                        const e = t[s];
                        "string" == typeof e &&
                            !He.has(e) &&
                            ke(e).values.length &&
                            (i = t[s]),
                            s++;
                    }
                    if (i && n) for (const s of e) t[s] = $e(n, i);
                })(t, n, e);
        }
        measureInitialState() {
            const { element: t, unresolvedKeyframes: e, name: n } = this;
            if (!t || !t.current) return;
            "height" === n && (this.suspendedScrollY = window.pageYOffset),
                (this.measuredOrigin = oe[n](
                    t.measureViewportBox(),
                    window.getComputedStyle(t.current)
                )),
                (e[0] = this.measuredOrigin);
            const s = e[e.length - 1];
            void 0 !== s && t.getValue(n, s).jump(s, !1);
        }
        measureEndState() {
            var t;
            const { element: e, name: n, unresolvedKeyframes: s } = this;
            if (!e || !e.current) return;
            const i = e.getValue(n);
            i && i.jump(this.measuredOrigin, !1);
            const r = s.length - 1,
                o = s[r];
            (s[r] = oe[n](
                e.measureViewportBox(),
                window.getComputedStyle(e.current)
            )),
                null !== o &&
                    void 0 === this.finalKeyframe &&
                    (this.finalKeyframe = o),
                (null === (t = this.removedTransforms) || void 0 === t
                    ? void 0
                    : t.length) &&
                    this.removedTransforms.forEach(([t, n]) => {
                        e.getValue(t).set(n);
                    }),
                this.resolveNoneKeyframes();
        }
    }
    const Ye = (t, e) =>
        "zIndex" !== e &&
        (!("number" != typeof t && !Array.isArray(t)) ||
            !(
                "string" != typeof t ||
                (!Oe.test(t) && "0" !== t) ||
                t.startsWith("url(")
            ));
    function qe(t, e, n, s) {
        const i = t[0];
        if (null === i) return !1;
        if ("display" === e || "visibility" === e) return !0;
        const r = t[t.length - 1],
            o = Ye(i, e),
            a = Ye(r, e);
        return (
            !(!o || !a) &&
            ((function (t) {
                const e = t[0];
                if (1 === t.length) return !0;
                for (let n = 0; n < t.length; n++) if (t[n] !== e) return !0;
            })(t) ||
                (("spring" === n || et(n)) && s))
        );
    }
    class Xe {
        constructor({
            autoplay: t = !0,
            delay: e = 0,
            type: n = "keyframes",
            repeat: s = 0,
            repeatDelay: i = 0,
            repeatType: r = "loop",
            ...o
        }) {
            (this.isStopped = !1),
                (this.hasAttemptedResolve = !1),
                (this.createdAt = g.now()),
                (this.options = {
                    autoplay: t,
                    delay: e,
                    type: n,
                    repeat: s,
                    repeatDelay: i,
                    repeatType: r,
                    ...o,
                }),
                this.updateFinishedPromise();
        }
        calcStartTime() {
            return this.resolvedAt && this.resolvedAt - this.createdAt > 40
                ? this.resolvedAt
                : this.createdAt;
        }
        get resolved() {
            return (
                this._resolved || this.hasAttemptedResolve || (fe(), pe()),
                this._resolved
            );
        }
        onKeyframesResolved(t, e) {
            (this.resolvedAt = g.now()), (this.hasAttemptedResolve = !0);
            const {
                name: n,
                type: s,
                velocity: i,
                delay: r,
                onComplete: o,
                onUpdate: a,
                isGenerator: l,
            } = this.options;
            if (!l && !qe(t, n, s, i)) {
                if (!r)
                    return (
                        null == a || a(St(t, this.options, e)),
                        null == o || o(),
                        void this.resolveFinishedPromise()
                    );
                this.options.duration = 0;
            }
            const u = this.initPlayback(t, e);
            !1 !== u &&
                ((this._resolved = { keyframes: t, finalKeyframe: e, ...u }),
                this.onPostResolved());
        }
        onPostResolved() {}
        then(t, e) {
            return this.currentFinishedPromise.then(t, e);
        }
        flatten() {
            (this.options.type = "keyframes"), (this.options.ease = "linear");
        }
        updateFinishedPromise() {
            this.currentFinishedPromise = new Promise((t) => {
                this.resolveFinishedPromise = t;
            });
        }
    }
    function Ge({
        keyframes: t,
        velocity: e = 0,
        power: n = 0.8,
        timeConstant: s = 325,
        bounceDamping: i = 10,
        bounceStiffness: r = 500,
        modifyTarget: o,
        min: a,
        max: l,
        restDelta: u = 0.5,
        restSpeed: c,
    }) {
        const h = t[0],
            d = { done: !1, value: h },
            p = (t) =>
                void 0 === a
                    ? l
                    : void 0 === l || Math.abs(a - t) < Math.abs(l - t)
                    ? a
                    : l;
        let f = n * e;
        const m = h + f,
            g = void 0 === o ? m : o(m);
        g !== m && (f = g - h);
        const y = (t) => -f * Math.exp(-t / s),
            v = (t) => g + y(t),
            w = (t) => {
                const e = y(t),
                    n = v(t);
                (d.done = Math.abs(e) <= u), (d.value = d.done ? g : n);
            };
        let b, x;
        const T = (t) => {
            var e;
            ((e = d.value),
            (void 0 !== a && e < a) || (void 0 !== l && e > l)) &&
                ((b = t),
                (x = q({
                    keyframes: [d.value, p(d.value)],
                    velocity: M(v, t, d.value),
                    damping: i,
                    stiffness: r,
                    restDelta: u,
                    restSpeed: c,
                })));
        };
        return (
            T(0),
            {
                calculatedDuration: null,
                next: (t) => {
                    let e = !1;
                    return (
                        x || void 0 !== b || ((e = !0), w(t), T(t)),
                        void 0 !== b && t >= b ? x.next(t - b) : (!e && w(t), d)
                    );
                },
            }
        );
    }
    const Ze = At(0.42, 0, 1, 1),
        _e = At(0, 0, 0.58, 1),
        Je = At(0.42, 0, 0.58, 1),
        Qe = (t) => Array.isArray(t) && "number" == typeof t[0],
        tn = {
            linear: e,
            easeIn: Ze,
            easeInOut: Je,
            easeOut: _e,
            circIn: Ot,
            circInOut: Rt,
            circOut: It,
            backIn: Ft,
            backInOut: Ct,
            backOut: kt,
            anticipate: Et,
        },
        en = (t) => {
            if (Qe(t)) {
                n(4 === t.length);
                const [e, s, i, r] = t;
                return At(e, s, i, r);
            }
            return "string" == typeof t ? tn[t] : t;
        },
        nn = (t, e) => (n) => e(t(n)),
        sn = (...t) => t.reduce(nn);
    function rn(t, e, n) {
        return (
            n < 0 && (n += 1),
            n > 1 && (n -= 1),
            n < 1 / 6
                ? t + 6 * (e - t) * n
                : n < 0.5
                ? e
                : n < 2 / 3
                ? t + (e - t) * (2 / 3 - n) * 6
                : t
        );
    }
    function on(t, e) {
        return (n) => (n > 0 ? e : t);
    }
    const an = (t, e, n) => {
            const s = t * t,
                i = n * (e * e - s) + s;
            return i < 0 ? 0 : Math.sqrt(i);
        },
        ln = [Se, Te, Ve];
    function un(t) {
        const e = ((n = t), ln.find((t) => t.test(n)));
        var n;
        if (!Boolean(e)) return !1;
        let s = e.parse(t);
        return (
            e === Ve &&
                (s = (function ({
                    hue: t,
                    saturation: e,
                    lightness: n,
                    alpha: s,
                }) {
                    (t /= 360), (n /= 100);
                    let i = 0,
                        r = 0,
                        o = 0;
                    if ((e /= 100)) {
                        const s = n < 0.5 ? n * (1 + e) : n + e - n * e,
                            a = 2 * n - s;
                        (i = rn(a, s, t + 1 / 3)),
                            (r = rn(a, s, t)),
                            (o = rn(a, s, t - 1 / 3));
                    } else i = r = o = n;
                    return {
                        red: Math.round(255 * i),
                        green: Math.round(255 * r),
                        blue: Math.round(255 * o),
                        alpha: s,
                    };
                })(s)),
            s
        );
    }
    const cn = (t, e) => {
            const n = un(t),
                s = un(e);
            if (!n || !s) return on(t, e);
            const i = { ...n };
            return (t) => (
                (i.red = an(n.red, s.red, t)),
                (i.green = an(n.green, s.green, t)),
                (i.blue = an(n.blue, s.blue, t)),
                (i.alpha = G(n.alpha, s.alpha, t)),
                Te.transform(i)
            );
        },
        hn = new Set(["none", "hidden"]);
    function dn(t, e) {
        return (n) => G(t, e, n);
    }
    function pn(t) {
        return "number" == typeof t
            ? dn
            : "string" == typeof t
            ? Kt(t)
                ? on
                : Ae.test(t)
                ? cn
                : gn
            : Array.isArray(t)
            ? fn
            : "object" == typeof t
            ? Ae.test(t)
                ? cn
                : mn
            : on;
    }
    function fn(t, e) {
        const n = [...t],
            s = n.length,
            i = t.map((t, n) => pn(t)(t, e[n]));
        return (t) => {
            for (let e = 0; e < s; e++) n[e] = i[e](t);
            return n;
        };
    }
    function mn(t, e) {
        const n = { ...t, ...e },
            s = {};
        for (const i in n)
            void 0 !== t[i] && void 0 !== e[i] && (s[i] = pn(t[i])(t[i], e[i]));
        return (t) => {
            for (const e in s) n[e] = s[e](t);
            return n;
        };
    }
    const gn = (t, e) => {
        const n = Oe.createTransformer(e),
            s = ke(t),
            i = ke(e);
        return s.indexes.var.length === i.indexes.var.length &&
            s.indexes.color.length === i.indexes.color.length &&
            s.indexes.number.length >= i.indexes.number.length
            ? (hn.has(t) && !i.values.length) || (hn.has(e) && !s.values.length)
                ? (function (t, e) {
                      return hn.has(t)
                          ? (n) => (n <= 0 ? t : e)
                          : (n) => (n >= 1 ? e : t);
                  })(t, e)
                : sn(
                      fn(
                          (function (t, e) {
                              var n;
                              const s = [],
                                  i = { color: 0, var: 0, number: 0 };
                              for (let r = 0; r < e.values.length; r++) {
                                  const o = e.types[r],
                                      a = t.indexes[o][i[o]],
                                      l =
                                          null !== (n = t.values[a]) &&
                                          void 0 !== n
                                              ? n
                                              : 0;
                                  (s[r] = l), i[o]++;
                              }
                              return s;
                          })(s, i),
                          i.values
                      ),
                      n
                  )
            : on(t, e);
    };
    function yn(t, e, n) {
        if (
            "number" == typeof t &&
            "number" == typeof e &&
            "number" == typeof n
        )
            return G(t, e, n);
        return pn(t)(t, e);
    }
    function vn(t, s, { clamp: i = !0, ease: r, mixer: o } = {}) {
        const a = t.length;
        if ((n(a === s.length), 1 === a)) return () => s[0];
        if (2 === a && t[0] === t[1]) return () => s[1];
        t[0] > t[a - 1] && ((t = [...t].reverse()), (s = [...s].reverse()));
        const l = (function (t, n, s) {
                const i = [],
                    r = s || yn,
                    o = t.length - 1;
                for (let s = 0; s < o; s++) {
                    let o = r(t[s], t[s + 1]);
                    if (n) {
                        const t = Array.isArray(n) ? n[s] || e : n;
                        o = sn(t, o);
                    }
                    i.push(o);
                }
                return i;
            })(s, r, o),
            u = l.length,
            c = (e) => {
                let n = 0;
                if (u > 1) for (; n < t.length - 2 && !(e < t[n + 1]); n++);
                const s = T(t[n], t[n + 1], e);
                return l[n](s);
            };
        return i ? (e) => c(P(t[0], t[a - 1], e)) : c;
    }
    function wn({
        duration: t = 300,
        keyframes: e,
        times: n,
        ease: s = "easeInOut",
    }) {
        const i = it(s) ? s.map(en) : en(s),
            r = { done: !1, value: e[0] },
            o = vn(
                (function (t, e) {
                    return t.map((t) => t * e);
                })(n && n.length === e.length ? n : _(e), t),
                e,
                {
                    ease: Array.isArray(i)
                        ? i
                        : ((a = e),
                          (l = i),
                          a.map(() => l || Je).splice(0, a.length - 1)),
                }
            );
        var a, l;
        return {
            calculatedDuration: t,
            next: (e) => ((r.value = o(e)), (r.done = e >= t), r),
        };
    }
    const bn = (t) => {
            const e = ({ timestamp: e }) => t(e);
            return {
                start: () => c.update(e, !0),
                stop: () => h(e),
                now: () => (d.isProcessing ? d.timestamp : g.now()),
            };
        },
        xn = { decay: Ge, inertia: Ge, tween: wn, keyframes: wn, spring: q },
        Tn = (t) => t / 100;
    class Sn extends Xe {
        constructor(t) {
            super(t),
                (this.holdTime = null),
                (this.cancelTime = null),
                (this.currentTime = 0),
                (this.playbackSpeed = 1),
                (this.pendingPlayState = "running"),
                (this.startTime = null),
                (this.state = "idle"),
                (this.stop = () => {
                    if (
                        (this.resolver.cancel(),
                        (this.isStopped = !0),
                        "idle" === this.state)
                    )
                        return;
                    this.teardown();
                    const { onStop: t } = this.options;
                    t && t();
                });
            const {
                    name: e,
                    motionValue: n,
                    element: s,
                    keyframes: i,
                } = this.options,
                r = (null == s ? void 0 : s.KeyframeResolver) || me;
            (this.resolver = new r(
                i,
                (t, e) => this.onKeyframesResolved(t, e),
                e,
                n,
                s
            )),
                this.resolver.scheduleResolve();
        }
        flatten() {
            super.flatten(),
                this._resolved &&
                    Object.assign(
                        this._resolved,
                        this.initPlayback(this._resolved.keyframes)
                    );
        }
        initPlayback(t) {
            const {
                    type: e = "keyframes",
                    repeat: n = 0,
                    repeatDelay: s = 0,
                    repeatType: i,
                    velocity: r = 0,
                } = this.options,
                o = et(e) ? e : xn[e] || wn;
            let a, l;
            o !== wn &&
                "number" != typeof t[0] &&
                ((a = sn(Tn, yn(t[0], t[1]))), (t = [0, 100]));
            const u = o({ ...this.options, keyframes: t });
            "mirror" === i &&
                (l = o({
                    ...this.options,
                    keyframes: [...t].reverse(),
                    velocity: -r,
                })),
                null === u.calculatedDuration && (u.calculatedDuration = $(u));
            const { calculatedDuration: c } = u,
                h = c + s;
            return {
                generator: u,
                mirroredGenerator: l,
                mapPercentToKeyframes: a,
                calculatedDuration: c,
                resolvedDuration: h,
                totalDuration: h * (n + 1) - s,
            };
        }
        onPostResolved() {
            const { autoplay: t = !0 } = this.options;
            this.play(),
                "paused" !== this.pendingPlayState && t
                    ? (this.state = this.pendingPlayState)
                    : this.pause();
        }
        tick(t, e = !1) {
            const { resolved: n } = this;
            if (!n) {
                const { keyframes: t } = this.options;
                return { done: !0, value: t[t.length - 1] };
            }
            const {
                finalKeyframe: s,
                generator: i,
                mirroredGenerator: r,
                mapPercentToKeyframes: o,
                keyframes: a,
                calculatedDuration: l,
                totalDuration: u,
                resolvedDuration: c,
            } = n;
            if (null === this.startTime) return i.next(0);
            const {
                delay: h,
                repeat: d,
                repeatType: p,
                repeatDelay: f,
                onUpdate: m,
            } = this.options;
            this.speed > 0
                ? (this.startTime = Math.min(this.startTime, t))
                : this.speed < 0 &&
                  (this.startTime = Math.min(
                      t - u / this.speed,
                      this.startTime
                  )),
                e
                    ? (this.currentTime = t)
                    : null !== this.holdTime
                    ? (this.currentTime = this.holdTime)
                    : (this.currentTime =
                          Math.round(t - this.startTime) * this.speed);
            const g = this.currentTime - h * (this.speed >= 0 ? 1 : -1),
                y = this.speed >= 0 ? g < 0 : g > u;
            (this.currentTime = Math.max(g, 0)),
                "finished" === this.state &&
                    null === this.holdTime &&
                    (this.currentTime = u);
            let v = this.currentTime,
                w = i;
            if (d) {
                const t = Math.min(this.currentTime, u) / c;
                let e = Math.floor(t),
                    n = t % 1;
                !n && t >= 1 && (n = 1),
                    1 === n && e--,
                    (e = Math.min(e, d + 1));
                Boolean(e % 2) &&
                    ("reverse" === p
                        ? ((n = 1 - n), f && (n -= f / c))
                        : "mirror" === p && (w = r)),
                    (v = P(0, 1, n) * c);
            }
            const b = y ? { done: !1, value: a[0] } : w.next(v);
            o && (b.value = o(b.value));
            let { done: x } = b;
            y ||
                null === l ||
                (x =
                    this.speed >= 0
                        ? this.currentTime >= u
                        : this.currentTime <= 0);
            const T =
                null === this.holdTime &&
                ("finished" === this.state || ("running" === this.state && x));
            return (
                T && void 0 !== s && (b.value = St(a, this.options, s)),
                m && m(b.value),
                T && this.finish(),
                b
            );
        }
        get duration() {
            const { resolved: t } = this;
            return t ? A(t.calculatedDuration) : 0;
        }
        get time() {
            return A(this.currentTime);
        }
        set time(t) {
            (t = V(t)),
                (this.currentTime = t),
                null !== this.holdTime || 0 === this.speed
                    ? (this.holdTime = t)
                    : this.driver &&
                      (this.startTime = this.driver.now() - t / this.speed);
        }
        get speed() {
            return this.playbackSpeed;
        }
        set speed(t) {
            const e = this.playbackSpeed !== t;
            (this.playbackSpeed = t), e && (this.time = A(this.currentTime));
        }
        play() {
            if (
                (this.resolver.isScheduled || this.resolver.resume(),
                !this._resolved)
            )
                return void (this.pendingPlayState = "running");
            if (this.isStopped) return;
            const { driver: t = bn, onPlay: e, startTime: n } = this.options;
            this.driver || (this.driver = t((t) => this.tick(t))), e && e();
            const s = this.driver.now();
            null !== this.holdTime
                ? (this.startTime = s - this.holdTime)
                : this.startTime
                ? "finished" === this.state && (this.startTime = s)
                : (this.startTime = null != n ? n : this.calcStartTime()),
                "finished" === this.state && this.updateFinishedPromise(),
                (this.cancelTime = this.startTime),
                (this.holdTime = null),
                (this.state = "running"),
                this.driver.start();
        }
        pause() {
            var t;
            this._resolved
                ? ((this.state = "paused"),
                  (this.holdTime =
                      null !== (t = this.currentTime) && void 0 !== t ? t : 0))
                : (this.pendingPlayState = "paused");
        }
        complete() {
            "running" !== this.state && this.play(),
                (this.pendingPlayState = this.state = "finished"),
                (this.holdTime = null);
        }
        finish() {
            this.teardown(), (this.state = "finished");
            const { onComplete: t } = this.options;
            t && t();
        }
        cancel() {
            null !== this.cancelTime && this.tick(this.cancelTime),
                this.teardown(),
                this.updateFinishedPromise();
        }
        teardown() {
            (this.state = "idle"),
                this.stopDriver(),
                this.resolveFinishedPromise(),
                this.updateFinishedPromise(),
                (this.startTime = this.cancelTime = null),
                this.resolver.cancel();
        }
        stopDriver() {
            this.driver && (this.driver.stop(), (this.driver = void 0));
        }
        sample(t) {
            return (this.startTime = 0), this.tick(t, !0);
        }
    }
    const Vn = new Set(["opacity", "clipPath", "filter", "transform"]),
        An = { linearEasing: void 0 };
    function Mn(t, e) {
        const n = w(t);
        return () => {
            var t;
            return null !== (t = An[e]) && void 0 !== t ? t : n();
        };
    }
    const Pn = Mn(() => {
        try {
            document
                .createElement("div")
                .animate({ opacity: 0 }, { easing: "linear(0, 1)" });
        } catch (t) {
            return !1;
        }
        return !0;
    }, "linearEasing");
    function kn(t) {
        return Boolean(
            ("function" == typeof t && Pn()) ||
                !t ||
                ("string" == typeof t && (t in Cn || Pn())) ||
                Qe(t) ||
                (Array.isArray(t) && t.every(kn))
        );
    }
    const Fn = ([t, e, n, s]) => `cubic-bezier(${t}, ${e}, ${n}, ${s})`,
        Cn = {
            linear: "linear",
            ease: "ease",
            easeIn: "ease-in",
            easeOut: "ease-out",
            easeInOut: "ease-in-out",
            circIn: Fn([0, 0.65, 0.55, 1]),
            circOut: Fn([0.55, 0, 1, 0.45]),
            backIn: Fn([0.31, 0.01, 0.66, -0.59]),
            backOut: Fn([0.33, 1.53, 0.69, 0.99]),
        };
    function En(
        t,
        e,
        n,
        {
            delay: s = 0,
            duration: i = 300,
            repeat: r = 0,
            repeatType: o = "loop",
            ease: a = "easeInOut",
            times: l,
        } = {}
    ) {
        const u = { [e]: n };
        l && (u.offset = l);
        const c = (function t(e, n) {
            return e
                ? "function" == typeof e && Pn()
                    ? S(e, n)
                    : Qe(e)
                    ? Fn(e)
                    : Array.isArray(e)
                    ? e.map((e) => t(e, n) || Cn.easeOut)
                    : Cn[e]
                : void 0;
        })(a, i);
        return (
            Array.isArray(c) && (u.easing = c),
            t.animate(u, {
                delay: s,
                duration: i,
                easing: Array.isArray(c) ? "linear" : c,
                fill: "both",
                iterations: r + 1,
                direction: "reverse" === o ? "alternate" : "normal",
            })
        );
    }
    function On(t, e) {
        (t.timeline = e), (t.onfinish = null);
    }
    const In = w(() =>
        Object.hasOwnProperty.call(Element.prototype, "animate")
    );
    const Rn = { anticipate: Et, backInOut: Ct, circInOut: Rt };
    class Bn extends Xe {
        constructor(t) {
            super(t);
            const {
                name: e,
                motionValue: n,
                element: s,
                keyframes: i,
            } = this.options;
            (this.resolver = new Ue(
                i,
                (t, e) => this.onKeyframesResolved(t, e),
                e,
                n,
                s
            )),
                this.resolver.scheduleResolve();
        }
        initPlayback(t, e) {
            var n;
            let {
                duration: s = 300,
                times: i,
                ease: r,
                type: o,
                motionValue: a,
                name: l,
                startTime: u,
            } = this.options;
            if (!(null === (n = a.owner) || void 0 === n ? void 0 : n.current))
                return !1;
            var c;
            if (
                ("string" == typeof r && Pn() && r in Rn && (r = Rn[r]),
                et((c = this.options).type) ||
                    "spring" === c.type ||
                    !kn(c.ease))
            ) {
                const {
                        onComplete: e,
                        onUpdate: n,
                        motionValue: a,
                        element: l,
                        ...u
                    } = this.options,
                    c = (function (t, e) {
                        const n = new Sn({
                            ...e,
                            keyframes: t,
                            repeat: 0,
                            delay: 0,
                            isGenerator: !0,
                        });
                        let s = { done: !1, value: t[0] };
                        const i = [];
                        let r = 0;
                        for (; !s.done && r < 2e4; )
                            (s = n.sample(r)), i.push(s.value), (r += 10);
                        return {
                            times: void 0,
                            keyframes: i,
                            duration: r - 10,
                            ease: "linear",
                        };
                    })(t, u);
                1 === (t = c.keyframes).length && (t[1] = t[0]),
                    (s = c.duration),
                    (i = c.times),
                    (r = c.ease),
                    (o = "keyframes");
            }
            const h = En(a.owner.current, l, t, {
                ...this.options,
                duration: s,
                times: i,
                ease: r,
            });
            return (
                (h.startTime = null != u ? u : this.calcStartTime()),
                this.pendingTimeline
                    ? (On(h, this.pendingTimeline),
                      (this.pendingTimeline = void 0))
                    : (h.onfinish = () => {
                          const { onComplete: n } = this.options;
                          a.set(St(t, this.options, e)),
                              n && n(),
                              this.cancel(),
                              this.resolveFinishedPromise();
                      }),
                {
                    animation: h,
                    duration: s,
                    times: i,
                    type: o,
                    ease: r,
                    keyframes: t,
                }
            );
        }
        get duration() {
            const { resolved: t } = this;
            if (!t) return 0;
            const { duration: e } = t;
            return A(e);
        }
        get time() {
            const { resolved: t } = this;
            if (!t) return 0;
            const { animation: e } = t;
            return A(e.currentTime || 0);
        }
        set time(t) {
            const { resolved: e } = this;
            if (!e) return;
            const { animation: n } = e;
            n.currentTime = V(t);
        }
        get speed() {
            const { resolved: t } = this;
            if (!t) return 1;
            const { animation: e } = t;
            return e.playbackRate;
        }
        set speed(t) {
            const { resolved: e } = this;
            if (!e) return;
            const { animation: n } = e;
            n.playbackRate = t;
        }
        get state() {
            const { resolved: t } = this;
            if (!t) return "idle";
            const { animation: e } = t;
            return e.playState;
        }
        get startTime() {
            const { resolved: t } = this;
            if (!t) return null;
            const { animation: e } = t;
            return e.startTime;
        }
        attachTimeline(t) {
            if (this._resolved) {
                const { resolved: n } = this;
                if (!n) return e;
                const { animation: s } = n;
                On(s, t);
            } else this.pendingTimeline = t;
            return e;
        }
        play() {
            if (this.isStopped) return;
            const { resolved: t } = this;
            if (!t) return;
            const { animation: e } = t;
            "finished" === e.playState && this.updateFinishedPromise(),
                e.play();
        }
        pause() {
            const { resolved: t } = this;
            if (!t) return;
            const { animation: e } = t;
            e.pause();
        }
        stop() {
            if (
                (this.resolver.cancel(),
                (this.isStopped = !0),
                "idle" === this.state)
            )
                return;
            this.resolveFinishedPromise(), this.updateFinishedPromise();
            const { resolved: t } = this;
            if (!t) return;
            const {
                animation: e,
                keyframes: n,
                duration: s,
                type: i,
                ease: r,
                times: o,
            } = t;
            if ("idle" === e.playState || "finished" === e.playState) return;
            if (this.time) {
                const {
                        motionValue: t,
                        onUpdate: e,
                        onComplete: a,
                        element: l,
                        ...u
                    } = this.options,
                    c = new Sn({
                        ...u,
                        keyframes: n,
                        duration: s,
                        type: i,
                        ease: r,
                        times: o,
                        isGenerator: !0,
                    }),
                    h = V(this.time);
                t.setWithVelocity(
                    c.sample(h - 10).value,
                    c.sample(h).value,
                    10
                );
            }
            const { onStop: a } = this.options;
            a && a(), this.cancel();
        }
        complete() {
            const { resolved: t } = this;
            t && t.animation.finish();
        }
        cancel() {
            const { resolved: t } = this;
            t && t.animation.cancel();
        }
        static supports(t) {
            const {
                motionValue: e,
                name: n,
                repeatDelay: s,
                repeatType: i,
                damping: r,
                type: o,
            } = t;
            return (
                In() &&
                n &&
                Vn.has(n) &&
                e &&
                e.owner &&
                e.owner.current instanceof HTMLElement &&
                !e.owner.getProps().onUpdate &&
                !s &&
                "mirror" !== i &&
                0 !== r &&
                "inertia" !== o
            );
        }
    }
    const Dn =
            (t, e, n, s = {}, i, r) =>
            (o) => {
                const a = xt(s, t) || {},
                    l = a.delay || s.delay || 0;
                let { elapsed: u = 0 } = s;
                u -= V(l);
                let h = {
                    keyframes: Array.isArray(n) ? n : [null, n],
                    ease: "easeOut",
                    velocity: e.getVelocity(),
                    ...a,
                    delay: -u,
                    onUpdate: (t) => {
                        e.set(t), a.onUpdate && a.onUpdate(t);
                    },
                    onComplete: () => {
                        o(), a.onComplete && a.onComplete();
                    },
                    name: t,
                    motionValue: e,
                    element: r ? void 0 : i,
                };
                (function ({
                    when: t,
                    delay: e,
                    delayChildren: n,
                    staggerChildren: s,
                    staggerDirection: i,
                    repeat: r,
                    repeatType: o,
                    repeatDelay: a,
                    from: l,
                    elapsed: u,
                    ...c
                }) {
                    return !!Object.keys(c).length;
                })(a) || (h = { ...h, ...bt(t, h) }),
                    h.duration && (h.duration = V(h.duration)),
                    h.repeatDelay && (h.repeatDelay = V(h.repeatDelay)),
                    void 0 !== h.from && (h.keyframes[0] = h.from);
                let d = !1;
                if (
                    ((!1 === h.type || (0 === h.duration && !h.repeatDelay)) &&
                        ((h.duration = 0), 0 === h.delay && (d = !0)),
                    d && !r && void 0 !== e.get())
                ) {
                    const t = St(h.keyframes, a);
                    if (void 0 !== t)
                        return (
                            c.update(() => {
                                h.onUpdate(t), h.onComplete();
                            }),
                            new x([])
                        );
                }
                return !r && Bn.supports(h) ? new Bn(h) : new Sn(h);
            },
        Ln = (t) => (((t) => Array.isArray(t))(t) ? t[t.length - 1] || 0 : t);
    function Wn(t) {
        const e = [{}, {}];
        return (
            null == t ||
                t.values.forEach((t, n) => {
                    (e[0][n] = t.get()), (e[1][n] = t.getVelocity());
                }),
            e
        );
    }
    function Nn(t, e, n, s) {
        if ("function" == typeof e) {
            const [i, r] = Wn(s);
            e = e(void 0 !== n ? n : t.custom, i, r);
        }
        if (
            ("string" == typeof e && (e = t.variants && t.variants[e]),
            "function" == typeof e)
        ) {
            const [i, r] = Wn(s);
            e = e(void 0 !== n ? n : t.custom, i, r);
        }
        return e;
    }
    function Kn(t, e, n) {
        t.hasValue(e) ? t.getValue(e).set(n) : t.addValue(e, v(n));
    }
    function jn(t, e) {
        const n = (function (t, e, n) {
            const s = t.getProps();
            return Nn(s, e, void 0 !== n ? n : s.custom, t);
        })(t, e);
        let { transitionEnd: s = {}, transition: i = {}, ...r } = n || {};
        r = { ...r, ...s };
        for (const e in r) {
            Kn(t, e, Ln(r[e]));
        }
    }
    const zn = (t) => t.replace(/([a-z])([A-Z])/gu, "$1-$2").toLowerCase(),
        $n = "data-" + zn("framerAppearId");
    function Hn(t) {
        return t.props[$n];
    }
    function Un(t, e) {
        const n = t.getValue("willChange");
        if (((s = n), Boolean(J(s) && s.add))) return n.add(e);
        var s;
    }
    function Yn({ protectedKeys: t, needsAnimating: e }, n) {
        const s = t.hasOwnProperty(n) && !0 !== e[n];
        return (e[n] = !1), s;
    }
    function qn(t, e, { delay: n = 0, transitionOverride: s, type: i } = {}) {
        var r;
        let {
            transition: o = t.getDefaultTransition(),
            transitionEnd: a,
            ...l
        } = e;
        s && (o = s);
        const u = [],
            h = i && t.animationState && t.animationState.getState()[i];
        for (const e in l) {
            const s = t.getValue(
                    e,
                    null !== (r = t.latestValues[e]) && void 0 !== r ? r : null
                ),
                i = l[e];
            if (void 0 === i || (h && Yn(h, e))) continue;
            const a = { delay: n, ...xt(o || {}, e) };
            let d = !1;
            if (window.MotionHandoffAnimation) {
                const n = Hn(t);
                if (n) {
                    const t = window.MotionHandoffAnimation(n, e, c);
                    null !== t && ((a.startTime = t), (d = !0));
                }
            }
            Un(t, e),
                s.start(
                    Dn(
                        e,
                        s,
                        i,
                        t.shouldReduceMotion && gt.has(e) ? { type: !1 } : a,
                        t,
                        d
                    )
                );
            const p = s.animation;
            p && u.push(p);
        }
        return (
            a &&
                Promise.all(u).then(() => {
                    c.update(() => {
                        a && jn(t, a);
                    });
                }),
            u
        );
    }
    const Xn = {};
    function Gn(t, { layout: e, layoutId: n }) {
        return (
            gt.has(t) ||
            t.startsWith("origin") ||
            ((e || void 0 !== n) && (!!Xn[t] || "opacity" === t))
        );
    }
    function Zn(t, e, n) {
        var s;
        const { style: i } = t,
            r = {};
        for (const o in i)
            (J(i[o]) ||
                (e.style && J(e.style[o])) ||
                Gn(o, t) ||
                void 0 !==
                    (null === (s = null == n ? void 0 : n.getValue(o)) ||
                    void 0 === s
                        ? void 0
                        : s.liveStyle)) &&
                (r[o] = i[o]);
        return r;
    }
    const _n = "undefined" != typeof window,
        Jn = { current: null },
        Qn = { current: !1 };
    const ts = [
        "initial",
        "animate",
        "whileInView",
        "whileFocus",
        "whileHover",
        "whileTap",
        "whileDrag",
        "exit",
    ];
    function es(t) {
        return (
            (null !== (e = t.animate) &&
                "object" == typeof e &&
                "function" == typeof e.start) ||
            ts.some((e) =>
                (function (t) {
                    return "string" == typeof t || Array.isArray(t);
                })(t[e])
            )
        );
        var e;
    }
    const ns = {
            animation: [
                "animate",
                "variants",
                "whileHover",
                "whileTap",
                "exit",
                "whileInView",
                "whileFocus",
                "whileDrag",
            ],
            exit: ["exit"],
            drag: ["drag", "dragControls"],
            focus: ["whileFocus"],
            hover: ["whileHover", "onHoverStart", "onHoverEnd"],
            tap: ["whileTap", "onTap", "onTapStart", "onTapCancel"],
            pan: ["onPan", "onPanStart", "onPanSessionStart", "onPanEnd"],
            inView: ["whileInView", "onViewportEnter", "onViewportLeave"],
            layout: ["layout", "layoutId"],
        },
        ss = {};
    for (const t in ns) ss[t] = { isEnabled: (e) => ns[t].some((t) => !!e[t]) };
    const is = [...le, Ae, Oe],
        rs = () => ({ x: { min: 0, max: 0 }, y: { min: 0, max: 0 } }),
        os = [
            "AnimationStart",
            "AnimationComplete",
            "Update",
            "BeforeLayoutMeasure",
            "LayoutMeasure",
            "LayoutAnimationStart",
            "LayoutAnimationComplete",
        ];
    class as {
        scrapeMotionValuesFromProps(t, e, n) {
            return {};
        }
        constructor(
            {
                parent: t,
                props: e,
                presenceContext: n,
                reducedMotionConfig: s,
                blockInitialAnimation: i,
                visualState: r,
            },
            o = {}
        ) {
            (this.current = null),
                (this.children = new Set()),
                (this.isVariantNode = !1),
                (this.isControllingVariants = !1),
                (this.shouldReduceMotion = null),
                (this.values = new Map()),
                (this.KeyframeResolver = me),
                (this.features = {}),
                (this.valueSubscriptions = new Map()),
                (this.prevMotionValues = {}),
                (this.events = {}),
                (this.propEventSubscriptions = {}),
                (this.notifyUpdate = () =>
                    this.notify("Update", this.latestValues)),
                (this.render = () => {
                    this.current &&
                        (this.triggerBuild(),
                        this.renderInstance(
                            this.current,
                            this.renderState,
                            this.props.style,
                            this.projection
                        ));
                }),
                (this.renderScheduledAt = 0),
                (this.scheduleRender = () => {
                    const t = g.now();
                    this.renderScheduledAt < t &&
                        ((this.renderScheduledAt = t),
                        c.render(this.render, !1, !0));
                });
            const { latestValues: a, renderState: l } = r;
            (this.latestValues = a),
                (this.baseTarget = { ...a }),
                (this.initialValues = e.initial ? { ...a } : {}),
                (this.renderState = l),
                (this.parent = t),
                (this.props = e),
                (this.presenceContext = n),
                (this.depth = t ? t.depth + 1 : 0),
                (this.reducedMotionConfig = s),
                (this.options = o),
                (this.blockInitialAnimation = Boolean(i)),
                (this.isControllingVariants = es(e)),
                (this.isVariantNode = (function (t) {
                    return Boolean(es(t) || t.variants);
                })(e)),
                this.isVariantNode && (this.variantChildren = new Set()),
                (this.manuallyAnimateOnMount = Boolean(t && t.current));
            const { willChange: u, ...h } = this.scrapeMotionValuesFromProps(
                e,
                {},
                this
            );
            for (const t in h) {
                const e = h[t];
                void 0 !== a[t] && J(e) && e.set(a[t], !1);
            }
        }
        mount(t) {
            (this.current = t),
                ft.set(t, this),
                this.projection &&
                    !this.projection.instance &&
                    this.projection.mount(t),
                this.parent &&
                    this.isVariantNode &&
                    !this.isControllingVariants &&
                    (this.removeFromVariantTree =
                        this.parent.addVariantChild(this)),
                this.values.forEach((t, e) => this.bindToMotionValue(e, t)),
                Qn.current ||
                    (function () {
                        if (((Qn.current = !0), _n))
                            if (window.matchMedia) {
                                const t = window.matchMedia(
                                        "(prefers-reduced-motion)"
                                    ),
                                    e = () => (Jn.current = t.matches);
                                t.addListener(e), e();
                            } else Jn.current = !1;
                    })(),
                (this.shouldReduceMotion =
                    "never" !== this.reducedMotionConfig &&
                    ("always" === this.reducedMotionConfig || Jn.current)),
                this.parent && this.parent.children.add(this),
                this.update(this.props, this.presenceContext);
        }
        unmount() {
            ft.delete(this.current),
                this.projection && this.projection.unmount(),
                h(this.notifyUpdate),
                h(this.render),
                this.valueSubscriptions.forEach((t) => t()),
                this.valueSubscriptions.clear(),
                this.removeFromVariantTree && this.removeFromVariantTree(),
                this.parent && this.parent.children.delete(this);
            for (const t in this.events) this.events[t].clear();
            for (const t in this.features) {
                const e = this.features[t];
                e && (e.unmount(), (e.isMounted = !1));
            }
            this.current = null;
        }
        bindToMotionValue(t, e) {
            this.valueSubscriptions.has(t) && this.valueSubscriptions.get(t)();
            const n = gt.has(t),
                s = e.on("change", (e) => {
                    (this.latestValues[t] = e),
                        this.props.onUpdate && c.preRender(this.notifyUpdate),
                        n &&
                            this.projection &&
                            (this.projection.isTransformDirty = !0);
                }),
                i = e.on("renderRequest", this.scheduleRender);
            let r;
            window.MotionCheckAppearSync &&
                (r = window.MotionCheckAppearSync(this, t, e)),
                this.valueSubscriptions.set(t, () => {
                    s(), i(), r && r(), e.owner && e.stop();
                });
        }
        sortNodePosition(t) {
            return this.current &&
                this.sortInstanceNodePosition &&
                this.type === t.type
                ? this.sortInstanceNodePosition(this.current, t.current)
                : 0;
        }
        updateFeatures() {
            let t = "animation";
            for (t in ss) {
                const e = ss[t];
                if (!e) continue;
                const { isEnabled: n, Feature: s } = e;
                if (
                    (!this.features[t] &&
                        s &&
                        n(this.props) &&
                        (this.features[t] = new s(this)),
                    this.features[t])
                ) {
                    const e = this.features[t];
                    e.isMounted ? e.update() : (e.mount(), (e.isMounted = !0));
                }
            }
        }
        triggerBuild() {
            this.build(this.renderState, this.latestValues, this.props);
        }
        measureViewportBox() {
            return this.current
                ? this.measureInstanceViewportBox(this.current, this.props)
                : { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } };
        }
        getStaticValue(t) {
            return this.latestValues[t];
        }
        setStaticValue(t, e) {
            this.latestValues[t] = e;
        }
        update(t, e) {
            (t.transformTemplate || this.props.transformTemplate) &&
                this.scheduleRender(),
                (this.prevProps = this.props),
                (this.props = t),
                (this.prevPresenceContext = this.presenceContext),
                (this.presenceContext = e);
            for (let e = 0; e < os.length; e++) {
                const n = os[e];
                this.propEventSubscriptions[n] &&
                    (this.propEventSubscriptions[n](),
                    delete this.propEventSubscriptions[n]);
                const s = t["on" + n];
                s && (this.propEventSubscriptions[n] = this.on(n, s));
            }
            (this.prevMotionValues = (function (t, e, n) {
                for (const s in e) {
                    const i = e[s],
                        r = n[s];
                    if (J(i)) t.addValue(s, i);
                    else if (J(r)) t.addValue(s, v(i, { owner: t }));
                    else if (r !== i)
                        if (t.hasValue(s)) {
                            const e = t.getValue(s);
                            !0 === e.liveStyle
                                ? e.jump(i)
                                : e.hasAnimated || e.set(i);
                        } else {
                            const e = t.getStaticValue(s);
                            t.addValue(
                                s,
                                v(void 0 !== e ? e : i, { owner: t })
                            );
                        }
                }
                for (const s in n) void 0 === e[s] && t.removeValue(s);
                return e;
            })(
                this,
                this.scrapeMotionValuesFromProps(t, this.prevProps, this),
                this.prevMotionValues
            )),
                this.handleChildMotionValue && this.handleChildMotionValue();
        }
        getProps() {
            return this.props;
        }
        getVariant(t) {
            return this.props.variants ? this.props.variants[t] : void 0;
        }
        getDefaultTransition() {
            return this.props.transition;
        }
        getTransformPagePoint() {
            return this.props.transformPagePoint;
        }
        getClosestVariantNode() {
            return this.isVariantNode
                ? this
                : this.parent
                ? this.parent.getClosestVariantNode()
                : void 0;
        }
        addVariantChild(t) {
            const e = this.getClosestVariantNode();
            if (e)
                return (
                    e.variantChildren && e.variantChildren.add(t),
                    () => e.variantChildren.delete(t)
                );
        }
        addValue(t, e) {
            const n = this.values.get(t);
            e !== n &&
                (n && this.removeValue(t),
                this.bindToMotionValue(t, e),
                this.values.set(t, e),
                (this.latestValues[t] = e.get()));
        }
        removeValue(t) {
            this.values.delete(t);
            const e = this.valueSubscriptions.get(t);
            e && (e(), this.valueSubscriptions.delete(t)),
                delete this.latestValues[t],
                this.removeValueFromRenderState(t, this.renderState);
        }
        hasValue(t) {
            return this.values.has(t);
        }
        getValue(t, e) {
            if (this.props.values && this.props.values[t])
                return this.props.values[t];
            let n = this.values.get(t);
            return (
                void 0 === n &&
                    void 0 !== e &&
                    ((n = v(null === e ? void 0 : e, { owner: this })),
                    this.addValue(t, n)),
                n
            );
        }
        readValue(t, e) {
            var n;
            let s =
                void 0 === this.latestValues[t] && this.current
                    ? null !==
                          (n = this.getBaseTargetFromProps(this.props, t)) &&
                      void 0 !== n
                        ? n
                        : this.readValueFromInstance(
                              this.current,
                              t,
                              this.options
                          )
                    : this.latestValues[t];
            var i;
            return (
                null != s &&
                    ("string" == typeof s && (Dt(s) || Bt(s))
                        ? (s = parseFloat(s))
                        : ((i = s),
                          !is.find(ae(i)) && Oe.test(e) && (s = $e(t, e))),
                    this.setBaseTarget(t, J(s) ? s.get() : s)),
                J(s) ? s.get() : s
            );
        }
        setBaseTarget(t, e) {
            this.baseTarget[t] = e;
        }
        getBaseTarget(t) {
            var e;
            const { initial: n } = this.props;
            let s;
            if ("string" == typeof n || "object" == typeof n) {
                const i = Nn(
                    this.props,
                    n,
                    null === (e = this.presenceContext) || void 0 === e
                        ? void 0
                        : e.custom
                );
                i && (s = i[t]);
            }
            if (n && void 0 !== s) return s;
            const i = this.getBaseTargetFromProps(this.props, t);
            return void 0 === i || J(i)
                ? void 0 !== this.initialValues[t] && void 0 === s
                    ? void 0
                    : this.baseTarget[t]
                : i;
        }
        on(t, e) {
            return (
                this.events[t] || (this.events[t] = new o()),
                this.events[t].add(e)
            );
        }
        notify(t, ...e) {
            this.events[t] && this.events[t].notify(...e);
        }
    }
    class ls extends as {
        constructor() {
            super(...arguments), (this.KeyframeResolver = Ue);
        }
        sortInstanceNodePosition(t, e) {
            return 2 & t.compareDocumentPosition(e) ? 1 : -1;
        }
        getBaseTargetFromProps(t, e) {
            return t.style ? t.style[e] : void 0;
        }
        removeValueFromRenderState(t, { vars: e, style: n }) {
            delete e[t], delete n[t];
        }
        handleChildMotionValue() {
            this.childSubscription &&
                (this.childSubscription(), delete this.childSubscription);
            const { children: t } = this.props;
            J(t) &&
                (this.childSubscription = t.on("change", (t) => {
                    this.current && (this.current.textContent = "" + t);
                }));
        }
    }
    const us = (t, e) => (e && "number" == typeof t ? e.transform(t) : t),
        cs = {
            x: "translateX",
            y: "translateY",
            z: "translateZ",
            transformPerspective: "perspective",
        },
        hs = mt.length;
    function ds(t, e, n) {
        const { style: s, vars: i, transformOrigin: r } = t;
        let o = !1,
            a = !1;
        for (const t in e) {
            const n = e[t];
            if (gt.has(t)) o = !0;
            else if (Wt(t)) i[t] = n;
            else {
                const e = us(n, Ke[t]);
                t.startsWith("origin") ? ((a = !0), (r[t] = e)) : (s[t] = e);
            }
        }
        if (
            (e.transform ||
                (o || n
                    ? (s.transform = (function (t, e, n) {
                          let s = "",
                              i = !0;
                          for (let r = 0; r < hs; r++) {
                              const o = mt[r],
                                  a = t[o];
                              if (void 0 === a) continue;
                              let l = !0;
                              if (
                                  ((l =
                                      "number" == typeof a
                                          ? a ===
                                            (o.startsWith("scale") ? 1 : 0)
                                          : 0 === parseFloat(a)),
                                  !l || n)
                              ) {
                                  const t = us(a, Ke[o]);
                                  if (!l) {
                                      i = !1;
                                      s += `${cs[o] || o}(${t}) `;
                                  }
                                  n && (e[o] = t);
                              }
                          }
                          return (
                              (s = s.trim()),
                              n ? (s = n(e, i ? "" : s)) : i && (s = "none"),
                              s
                          );
                      })(e, t.transform, n))
                    : s.transform && (s.transform = "none")),
            a)
        ) {
            const {
                originX: t = "50%",
                originY: e = "50%",
                originZ: n = 0,
            } = r;
            s.transformOrigin = `${t} ${e} ${n}`;
        }
    }
    function ps(t, e, n) {
        return "string" == typeof t ? t : Zt.transform(e + n * t);
    }
    const fs = { offset: "stroke-dashoffset", array: "stroke-dasharray" },
        ms = { offset: "strokeDashoffset", array: "strokeDasharray" };
    function gs(
        t,
        {
            attrX: e,
            attrY: n,
            attrScale: s,
            originX: i,
            originY: r,
            pathLength: o,
            pathSpacing: a = 1,
            pathOffset: l = 0,
            ...u
        },
        c,
        h
    ) {
        if ((ds(t, u, h), c))
            return void (
                t.style.viewBox && (t.attrs.viewBox = t.style.viewBox)
            );
        (t.attrs = t.style), (t.style = {});
        const { attrs: d, style: p, dimensions: f } = t;
        d.transform && (f && (p.transform = d.transform), delete d.transform),
            f &&
                (void 0 !== i || void 0 !== r || p.transform) &&
                (p.transformOrigin = (function (t, e, n) {
                    return `${ps(e, t.x, t.width)} ${ps(n, t.y, t.height)}`;
                })(f, void 0 !== i ? i : 0.5, void 0 !== r ? r : 0.5)),
            void 0 !== e && (d.x = e),
            void 0 !== n && (d.y = n),
            void 0 !== s && (d.scale = s),
            void 0 !== o &&
                (function (t, e, n = 1, s = 0, i = !0) {
                    t.pathLength = 1;
                    const r = i ? fs : ms;
                    t[r.offset] = Zt.transform(-s);
                    const o = Zt.transform(e),
                        a = Zt.transform(n);
                    t[r.array] = `${o} ${a}`;
                })(d, o, a, l, !1);
    }
    const ys = new Set([
        "baseFrequency",
        "diffuseConstant",
        "kernelMatrix",
        "kernelUnitLength",
        "keySplines",
        "keyTimes",
        "limitingConeAngle",
        "markerHeight",
        "markerWidth",
        "numOctaves",
        "targetX",
        "targetY",
        "surfaceScale",
        "specularConstant",
        "specularExponent",
        "stdDeviation",
        "tableValues",
        "viewBox",
        "gradientTransform",
        "pathLength",
        "startOffset",
        "textLength",
        "lengthAdjust",
    ]);
    function vs(t, { style: e, vars: n }, s, i) {
        Object.assign(t.style, e, i && i.getProjectionStyles(s));
        for (const e in n) t.style.setProperty(e, n[e]);
    }
    class ws extends ls {
        constructor() {
            super(...arguments),
                (this.type = "svg"),
                (this.isSVGTag = !1),
                (this.measureInstanceViewportBox = rs);
        }
        getBaseTargetFromProps(t, e) {
            return t[e];
        }
        readValueFromInstance(t, e) {
            if (gt.has(e)) {
                const t = ze(e);
                return (t && t.default) || 0;
            }
            return (e = ys.has(e) ? e : zn(e)), t.getAttribute(e);
        }
        scrapeMotionValuesFromProps(t, e, n) {
            return (function (t, e, n) {
                const s = Zn(t, e, n);
                for (const n in t)
                    if (J(t[n]) || J(e[n])) {
                        s[
                            -1 !== mt.indexOf(n)
                                ? "attr" +
                                  n.charAt(0).toUpperCase() +
                                  n.substring(1)
                                : n
                        ] = t[n];
                    }
                return s;
            })(t, e, n);
        }
        build(t, e, n) {
            gs(t, e, this.isSVGTag, n.transformTemplate);
        }
        renderInstance(t, e, n, s) {
            !(function (t, e, n, s) {
                vs(t, e, void 0, s);
                for (const n in e.attrs)
                    t.setAttribute(ys.has(n) ? n : zn(n), e.attrs[n]);
            })(t, e, 0, s);
        }
        mount(t) {
            var e;
            (this.isSVGTag =
                "string" == typeof (e = t.tagName) &&
                "svg" === e.toLowerCase()),
                super.mount(t);
        }
    }
    class bs extends ls {
        constructor() {
            super(...arguments),
                (this.type = "html"),
                (this.renderInstance = vs);
        }
        readValueFromInstance(t, e) {
            if (gt.has(e)) {
                const t = ze(e);
                return (t && t.default) || 0;
            }
            {
                const s = ((n = t), window.getComputedStyle(n)),
                    i = (Wt(e) ? s.getPropertyValue(e) : s[e]) || 0;
                return "string" == typeof i ? i.trim() : i;
            }
            var n;
        }
        measureInstanceViewportBox(t, { transformPagePoint: e }) {
            return (function (t, e) {
                return (function ({ top: t, left: e, right: n, bottom: s }) {
                    return { x: { min: e, max: n }, y: { min: t, max: s } };
                })(
                    (function (t, e) {
                        if (!e) return t;
                        const n = e({ x: t.left, y: t.top }),
                            s = e({ x: t.right, y: t.bottom });
                        return { top: n.y, left: n.x, bottom: s.y, right: s.x };
                    })(t.getBoundingClientRect(), e)
                );
            })(t, e);
        }
        build(t, e, n) {
            ds(t, e, n.transformTemplate);
        }
        scrapeMotionValuesFromProps(t, e, n) {
            return Zn(t, e, n);
        }
    }
    class xs extends as {
        constructor() {
            super(...arguments), (this.type = "object");
        }
        readValueFromInstance(t, e) {
            if (
                (function (t, e) {
                    return t in e;
                })(e, t)
            ) {
                const n = t[e];
                if ("string" == typeof n || "number" == typeof n) return n;
            }
        }
        getBaseTargetFromProps() {}
        removeValueFromRenderState(t, e) {
            delete e.output[t];
        }
        measureInstanceViewportBox() {
            return { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } };
        }
        build(t, e) {
            Object.assign(t.output, e);
        }
        renderInstance(t, { output: e }) {
            Object.assign(t, e);
        }
        sortInstanceNodePosition() {
            return 0;
        }
    }
    function Ts(t) {
        const e = {
                presenceContext: null,
                props: {},
                visualState: {
                    renderState: {
                        transform: {},
                        transformOrigin: {},
                        style: {},
                        vars: {},
                        attrs: {},
                    },
                    latestValues: {},
                },
            },
            n = (function (t) {
                return t instanceof SVGElement && "svg" !== t.tagName;
            })(t)
                ? new ws(e)
                : new bs(e);
        n.mount(t), ft.set(t, n);
    }
    function Ss(t) {
        const e = new xs({
            presenceContext: null,
            props: {},
            visualState: { renderState: { output: {} }, latestValues: {} },
        });
        e.mount(t), ft.set(t, e);
    }
    function Vs(t, e, n, s) {
        const i = [];
        if (
            (function (t, e) {
                return (
                    J(t) ||
                    "number" == typeof t ||
                    ("string" == typeof t && !Q(e))
                );
            })(t, e)
        )
            i.push(
                (function (t, e, n) {
                    const s = J(t) ? t : v(t);
                    return s.start(Dn("", s, e, n)), s.animation;
                })(t, (Q(e) && e.default) || e, (n && n.default) || n)
            );
        else {
            const r = tt(t, e, s),
                o = r.length;
            for (let t = 0; t < o; t++) {
                const s = r[t],
                    a = s instanceof Element ? Ts : Ss;
                ft.has(s) || a(s);
                const l = ft.get(s),
                    u = { ...n };
                "delay" in u &&
                    "function" == typeof u.delay &&
                    (u.delay = u.delay(t, o)),
                    i.push(...qn(l, { ...e, transition: u }, {}));
            }
        }
        return i;
    }
    function As(t, e, n) {
        const s = [];
        return (
            (function (t, { defaultTransition: e = {}, ...n } = {}, s, i) {
                const r = e.duration || 0.3,
                    o = new Map(),
                    a = new Map(),
                    l = {},
                    u = new Map();
                let c = 0,
                    h = 0,
                    d = 0;
                for (let n = 0; n < t.length; n++) {
                    const o = t[n];
                    if ("string" == typeof o) {
                        u.set(o, h);
                        continue;
                    }
                    if (!Array.isArray(o)) {
                        u.set(o.name, nt(h, o.at, c, u));
                        continue;
                    }
                    let [p, f, m = {}] = o;
                    void 0 !== m.at && (h = nt(h, m.at, c, u));
                    let g = 0;
                    const y = (t, n, s, o = 0, a = 0) => {
                        const l = ct(t),
                            {
                                delay: u = 0,
                                times: c = _(l),
                                type: p = "keyframes",
                                ...f
                            } = n;
                        let { ease: m = e.ease || "easeOut", duration: y } = n;
                        const v = "function" == typeof u ? u(o, a) : u,
                            w = l.length,
                            b = et(p) ? p : null == i ? void 0 : i[p];
                        if (w <= 2 && b) {
                            let t = 100;
                            if (2 === w && pt(l)) {
                                const e = l[1] - l[0];
                                t = Math.abs(e);
                            }
                            const e = { ...f };
                            void 0 !== y && (e.duration = V(y));
                            const n = X(e, t, b);
                            (m = n.ease), (y = n.duration);
                        }
                        null != y || (y = r);
                        const x = h + v,
                            T = x + y;
                        1 === c.length && 0 === c[0] && (c[1] = 1);
                        const S = c.length - l.length;
                        S > 0 && Z(c, S),
                            1 === l.length && l.unshift(null),
                            ot(s, l, m, c, x, T),
                            (g = Math.max(v + y, g)),
                            (d = Math.max(T, d));
                    };
                    if (J(p)) {
                        y(f, m, ut("default", lt(p, a)));
                    } else {
                        const t = tt(p, f, s, l),
                            e = t.length;
                        for (let n = 0; n < e; n++) {
                            (f = f), (m = m);
                            const s = lt(t[n], a);
                            for (const t in f)
                                y(f[t], ht(m, t), ut(t, s), n, e);
                        }
                    }
                    (c = h), (h += g);
                }
                return (
                    a.forEach((t, s) => {
                        for (const i in t) {
                            const r = t[i];
                            r.sort(at);
                            const a = [],
                                l = [],
                                u = [];
                            for (let t = 0; t < r.length; t++) {
                                const { at: e, value: n, easing: s } = r[t];
                                a.push(n),
                                    l.push(T(0, d, e)),
                                    u.push(s || "easeOut");
                            }
                            0 !== l[0] &&
                                (l.unshift(0),
                                a.unshift(a[0]),
                                u.unshift("easeInOut")),
                                1 !== l[l.length - 1] &&
                                    (l.push(1), a.push(null)),
                                o.has(s) ||
                                    o.set(s, { keyframes: {}, transition: {} });
                            const c = o.get(s);
                            (c.keyframes[i] = a),
                                (c.transition[i] = {
                                    ...e,
                                    duration: d,
                                    ease: u,
                                    times: l,
                                    ...n,
                                });
                        }
                    }),
                    o
                );
            })(t, e, n, { spring: q }).forEach(
                ({ keyframes: t, transition: e }, n) => {
                    s.push(...Vs(n, t, e));
                }
            ),
            s
        );
    }
    function Ms(t) {
        return function (e, n, s) {
            let i = [];
            var r;
            (r = e),
                (i =
                    Array.isArray(r) && Array.isArray(r[0])
                        ? As(e, n, t)
                        : Vs(e, n, s, t));
            const o = new x(i);
            return t && t.animations.push(o), o;
        };
    }
    const Ps = Ms();
    function ks(t, e, n) {
        t.style.setProperty("--" + e, n);
    }
    function Fs(t, e, n) {
        t.style[e] = n;
    }
    const Cs = w(() => {
            try {
                document.createElement("div").animate({ opacity: [1] });
            } catch (t) {
                return !1;
            }
            return !0;
        }),
        Es = new WeakMap();
    function Os(t) {
        const e = Es.get(t) || new Map();
        return Es.set(t, e), Es.get(t);
    }
    class Is {
        constructor(t, e, s, i) {
            const r = e.startsWith("--");
            (this.setValue = r ? ks : Fs),
                (this.options = i),
                this.updateFinishedPromise(),
                n("string" != typeof i.type);
            const o = Os(t).get(e);
            o && o.stop();
            if (
                (Array.isArray(s) || (s = [s]),
                (function (t, e, n) {
                    for (let s = 0; s < e.length; s++)
                        null === e[s] && (e[s] = 0 === s ? n() : e[s - 1]),
                            "number" == typeof e[s] &&
                                Le[t] &&
                                (e[s] = Le[t].transform(e[s]));
                    !Cs() && e.length < 2 && e.unshift(n());
                })(e, s, () =>
                    e.startsWith("--")
                        ? t.style.getPropertyValue(e)
                        : window.getComputedStyle(t)[e]
                ),
                et(i.type))
            ) {
                const t = X(i, 100, i.type);
                (i.ease = Pn() ? t.ease : "easeOut"),
                    (i.duration = V(t.duration)),
                    (i.type = "keyframes");
            } else i.ease = i.ease || "easeOut";
            this.removeAnimation = () => {
                var n;
                return null === (n = Es.get(t)) || void 0 === n
                    ? void 0
                    : n.delete(e);
            };
            const a = () => {
                this.setValue(t, e, St(s, this.options)),
                    this.cancel(),
                    this.resolveFinishedPromise();
            };
            In()
                ? ((this.animation = En(t, e, s, i)),
                  !1 === i.autoplay && this.animation.pause(),
                  (this.animation.onfinish = a),
                  this.pendingTimeline &&
                      On(this.animation, this.pendingTimeline),
                  Os(t).set(e, this))
                : a();
        }
        get duration() {
            return A(this.options.duration || 300);
        }
        get time() {
            var t;
            return this.animation
                ? A(
                      (null === (t = this.animation) || void 0 === t
                          ? void 0
                          : t.currentTime) || 0
                  )
                : 0;
        }
        set time(t) {
            this.animation && (this.animation.currentTime = V(t));
        }
        get speed() {
            return this.animation ? this.animation.playbackRate : 1;
        }
        set speed(t) {
            this.animation && (this.animation.playbackRate = t);
        }
        get state() {
            return this.animation ? this.animation.playState : "finished";
        }
        get startTime() {
            return this.animation ? this.animation.startTime : null;
        }
        flatten() {
            var t;
            this.animation &&
                (null === (t = this.animation.effect) ||
                    void 0 === t ||
                    t.updateTiming({ easing: "linear" }));
        }
        play() {
            "finished" === this.state && this.updateFinishedPromise(),
                this.animation && this.animation.play();
        }
        pause() {
            this.animation && this.animation.pause();
        }
        stop() {
            this.animation &&
                "idle" !== this.state &&
                "finished" !== this.state &&
                (this.animation.commitStyles && this.animation.commitStyles(),
                this.cancel());
        }
        complete() {
            this.animation && this.animation.finish();
        }
        cancel() {
            this.removeAnimation();
            try {
                this.animation && this.animation.cancel();
            } catch (t) {}
        }
        then(t, e) {
            return this.currentFinishedPromise.then(t, e);
        }
        updateFinishedPromise() {
            this.currentFinishedPromise = new Promise((t) => {
                this.resolveFinishedPromise = t;
            });
        }
        attachTimeline(t) {
            return (
                this.animation
                    ? On(this.animation, t)
                    : (this.pendingTimeline = t),
                e
            );
        }
    }
    const Rs = ((t) =>
            function (e, n, i) {
                return new x(
                    (function (t, e, n, i) {
                        const r = s(t, i),
                            o = r.length,
                            a = [];
                        for (let t = 0; t < o; t++) {
                            const s = r[t],
                                i = { ...n };
                            "function" == typeof i.delay &&
                                (i.delay = i.delay(t, o));
                            for (const t in e) {
                                const n = e[t],
                                    r = { ...xt(i, t) };
                                (r.duration = r.duration
                                    ? V(r.duration)
                                    : r.duration),
                                    (r.delay = V(r.delay || 0)),
                                    a.push(new Is(s, t, n, r));
                            }
                        }
                        return a;
                    })(e, n, i, t)
                );
            })(),
        Bs = new WeakMap();
    let Ds;
    function Ls({ target: t, contentRect: e, borderBoxSize: n }) {
        var s;
        null === (s = Bs.get(t)) ||
            void 0 === s ||
            s.forEach((s) => {
                s({
                    target: t,
                    contentSize: e,
                    get size() {
                        return (function (t, e) {
                            if (e) {
                                const { inlineSize: t, blockSize: n } = e[0];
                                return { width: t, height: n };
                            }
                            return t instanceof SVGElement && "getBBox" in t
                                ? t.getBBox()
                                : {
                                      width: t.offsetWidth,
                                      height: t.offsetHeight,
                                  };
                        })(t, n);
                    },
                });
            });
    }
    function Ws(t) {
        t.forEach(Ls);
    }
    function Ns(t, e) {
        Ds ||
            ("undefined" != typeof ResizeObserver &&
                (Ds = new ResizeObserver(Ws)));
        const n = s(t);
        return (
            n.forEach((t) => {
                let n = Bs.get(t);
                n || ((n = new Set()), Bs.set(t, n)),
                    n.add(e),
                    null == Ds || Ds.observe(t);
            }),
            () => {
                n.forEach((t) => {
                    const n = Bs.get(t);
                    null == n || n.delete(e),
                        (null == n ? void 0 : n.size) ||
                            null == Ds ||
                            Ds.unobserve(t);
                });
            }
        );
    }
    const Ks = new Set();
    let js;
    function zs(t) {
        return (
            Ks.add(t),
            js ||
                ((js = () => {
                    const t = {
                            width: window.innerWidth,
                            height: window.innerHeight,
                        },
                        e = { target: window, size: t, contentSize: t };
                    Ks.forEach((t) => t(e));
                }),
                window.addEventListener("resize", js)),
            () => {
                Ks.delete(t), !Ks.size && js && (js = void 0);
            }
        );
    }
    const $s = {
        x: { length: "Width", position: "Left" },
        y: { length: "Height", position: "Top" },
    };
    function Hs(t, e, n, s) {
        const i = n[e],
            { length: r, position: o } = $s[e],
            l = i.current,
            u = n.time;
        (i.current = t["scroll" + o]),
            (i.scrollLength = t["scroll" + r] - t["client" + r]),
            (i.offset.length = 0),
            (i.offset[0] = 0),
            (i.offset[1] = i.scrollLength),
            (i.progress = T(0, i.scrollLength, i.current));
        const c = s - u;
        i.velocity = c > 50 ? 0 : a(i.current - l, c);
    }
    const Us = {
            Enter: [
                [0, 1],
                [1, 1],
            ],
            Exit: [
                [0, 0],
                [1, 0],
            ],
            Any: [
                [1, 0],
                [0, 1],
            ],
            All: [
                [0, 0],
                [1, 1],
            ],
        },
        Ys = { start: 0, center: 0.5, end: 1 };
    function qs(t, e, n = 0) {
        let s = 0;
        if ((t in Ys && (t = Ys[t]), "string" == typeof t)) {
            const e = parseFloat(t);
            t.endsWith("px")
                ? (s = e)
                : t.endsWith("%")
                ? (t = e / 100)
                : t.endsWith("vw")
                ? (s = (e / 100) * document.documentElement.clientWidth)
                : t.endsWith("vh")
                ? (s = (e / 100) * document.documentElement.clientHeight)
                : (t = e);
        }
        return "number" == typeof t && (s = e * t), n + s;
    }
    const Xs = [0, 0];
    function Gs(t, e, n, s) {
        let i = Array.isArray(t) ? t : Xs,
            r = 0,
            o = 0;
        return (
            "number" == typeof t
                ? (i = [t, t])
                : "string" == typeof t &&
                  (i = (t = t.trim()).includes(" ")
                      ? t.split(" ")
                      : [t, Ys[t] ? t : "0"]),
            (r = qs(i[0], n, s)),
            (o = qs(i[1], e)),
            r - o
        );
    }
    const Zs = { x: 0, y: 0 };
    function _s(t, e, n) {
        const { offset: s = Us.All } = n,
            { target: i = t, axis: r = "y" } = n,
            o = "y" === r ? "height" : "width",
            a =
                i !== t
                    ? (function (t, e) {
                          const n = { x: 0, y: 0 };
                          let s = t;
                          for (; s && s !== e; )
                              if (s instanceof HTMLElement)
                                  (n.x += s.offsetLeft),
                                      (n.y += s.offsetTop),
                                      (s = s.offsetParent);
                              else if ("svg" === s.tagName) {
                                  const t = s.getBoundingClientRect();
                                  s = s.parentElement;
                                  const e = s.getBoundingClientRect();
                                  (n.x += t.left - e.left),
                                      (n.y += t.top - e.top);
                              } else {
                                  if (!(s instanceof SVGGraphicsElement)) break;
                                  {
                                      const { x: t, y: e } = s.getBBox();
                                      (n.x += t), (n.y += e);
                                      let i = null,
                                          r = s.parentNode;
                                      for (; !i; )
                                          "svg" === r.tagName && (i = r),
                                              (r = s.parentNode);
                                      s = i;
                                  }
                              }
                          return n;
                      })(i, t)
                    : Zs,
            l =
                i === t
                    ? { width: t.scrollWidth, height: t.scrollHeight }
                    : (function (t) {
                          return "getBBox" in t && "svg" !== t.tagName
                              ? t.getBBox()
                              : {
                                    width: t.clientWidth,
                                    height: t.clientHeight,
                                };
                      })(i),
            u = { width: t.clientWidth, height: t.clientHeight };
        e[r].offset.length = 0;
        let c = !e[r].interpolate;
        const h = s.length;
        for (let t = 0; t < h; t++) {
            const n = Gs(s[t], u[o], l[o], a[r]);
            c || n === e[r].interpolatorOffsets[t] || (c = !0),
                (e[r].offset[t] = n);
        }
        c &&
            ((e[r].interpolate = vn(e[r].offset, _(s))),
            (e[r].interpolatorOffsets = [...e[r].offset])),
            (e[r].progress = e[r].interpolate(e[r].current));
    }
    function Js(t, e, n, s = {}) {
        return {
            measure: () =>
                (function (t, e = t, n) {
                    if (
                        ((n.x.targetOffset = 0),
                        (n.y.targetOffset = 0),
                        e !== t)
                    ) {
                        let s = e;
                        for (; s && s !== t; )
                            (n.x.targetOffset += s.offsetLeft),
                                (n.y.targetOffset += s.offsetTop),
                                (s = s.offsetParent);
                    }
                    (n.x.targetLength =
                        e === t ? e.scrollWidth : e.clientWidth),
                        (n.y.targetLength =
                            e === t ? e.scrollHeight : e.clientHeight),
                        (n.x.containerLength = t.clientWidth),
                        (n.y.containerLength = t.clientHeight);
                })(t, s.target, n),
            update: (e) => {
                !(function (t, e, n) {
                    Hs(t, "x", e, n), Hs(t, "y", e, n), (e.time = n);
                })(t, n, e),
                    (s.offset || s.target) && _s(t, n, s);
            },
            notify: () => e(n),
        };
    }
    const Qs = new WeakMap(),
        ti = new WeakMap(),
        ei = new WeakMap(),
        ni = (t) => (t === document.documentElement ? window : t);
    function si(t, { container: e = document.documentElement, ...n } = {}) {
        let s = ei.get(e);
        s || ((s = new Set()), ei.set(e, s));
        const i = Js(
            e,
            t,
            {
                time: 0,
                x: {
                    current: 0,
                    offset: [],
                    progress: 0,
                    scrollLength: 0,
                    targetOffset: 0,
                    targetLength: 0,
                    containerLength: 0,
                    velocity: 0,
                },
                y: {
                    current: 0,
                    offset: [],
                    progress: 0,
                    scrollLength: 0,
                    targetOffset: 0,
                    targetLength: 0,
                    containerLength: 0,
                    velocity: 0,
                },
            },
            n
        );
        if ((s.add(i), !Qs.has(e))) {
            const t = () => {
                    for (const t of s) t.measure();
                },
                n = () => {
                    for (const t of s) t.update(d.timestamp);
                },
                i = () => {
                    for (const t of s) t.notify();
                },
                a = () => {
                    c.read(t, !1, !0), c.read(n, !1, !0), c.update(i, !1, !0);
                };
            Qs.set(e, a);
            const l = ni(e);
            window.addEventListener("resize", a, { passive: !0 }),
                e !== document.documentElement &&
                    ti.set(
                        e,
                        ((o = a),
                        "function" == typeof (r = e) ? zs(r) : Ns(r, o))
                    ),
                l.addEventListener("scroll", a, { passive: !0 });
        }
        var r, o;
        const a = Qs.get(e);
        return (
            c.read(a, !1, !0),
            () => {
                var t;
                h(a);
                const n = ei.get(e);
                if (!n) return;
                if ((n.delete(i), n.size)) return;
                const s = Qs.get(e);
                Qs.delete(e),
                    s &&
                        (ni(e).removeEventListener("scroll", s),
                        null === (t = ti.get(e)) || void 0 === t || t(),
                        window.removeEventListener("resize", s));
            }
        );
    }
    function ii(t, e) {
        let n;
        const s = () => {
            const { currentTime: s } = e,
                i = (null === s ? 0 : s.value) / 100;
            n !== i && t(i), (n = i);
        };
        return c.update(s, !0), () => h(s);
    }
    const ri = new Map();
    function oi({
        source: t,
        container: e = document.documentElement,
        axis: n = "y",
    } = {}) {
        t && (e = t), ri.has(e) || ri.set(e, {});
        const s = ri.get(e);
        return (
            s[n] ||
                (s[n] = b()
                    ? new ScrollTimeline({ source: e, axis: n })
                    : (function ({ source: t, container: e, axis: n = "y" }) {
                          t && (e = t);
                          const s = { value: 0 },
                              i = si(
                                  (t) => {
                                      s.value = 100 * t[n].progress;
                                  },
                                  { container: e, axis: n }
                              );
                          return { currentTime: s, cancel: i };
                      })({ source: e, axis: n })),
            s[n]
        );
    }
    function ai(t) {
        return t && (t.target || t.offset);
    }
    const li = { some: 0, all: 1 };
    const ui = (t, e) => Math.abs(t - e);
    const ci = c,
        hi = u.reduce((t, e) => ((t[e] = (t) => h(t)), t), {});
    (t.MotionValue = y),
        (t.animate = Ps),
        (t.animateMini = Rs),
        (t.anticipate = Et),
        (t.backIn = Ft),
        (t.backInOut = Ct),
        (t.backOut = kt),
        (t.cancelFrame = h),
        (t.cancelSync = hi),
        (t.circIn = Ot),
        (t.circInOut = Rt),
        (t.circOut = It),
        (t.clamp = P),
        (t.createScopedAnimate = Ms),
        (t.cubicBezier = At),
        (t.delay = function (t, e) {
            return (function (t, e) {
                const n = g.now(),
                    s = ({ timestamp: i }) => {
                        const r = i - n;
                        r >= e && (h(s), t(r - e));
                    };
                return c.read(s, !0), () => h(s);
            })(t, V(e));
        }),
        (t.distance = ui),
        (t.distance2D = function (t, e) {
            const n = ui(t.x, e.x),
                s = ui(t.y, e.y);
            return Math.sqrt(n ** 2 + s ** 2);
        }),
        (t.easeIn = Ze),
        (t.easeInOut = Je),
        (t.easeOut = _e),
        (t.frame = c),
        (t.frameData = d),
        (t.frameSteps = p),
        (t.inView = function (
            t,
            e,
            { root: n, margin: i, amount: r = "some" } = {}
        ) {
            const o = s(t),
                a = new WeakMap(),
                l = new IntersectionObserver(
                    (t) => {
                        t.forEach((t) => {
                            const n = a.get(t.target);
                            if (t.isIntersecting !== Boolean(n))
                                if (t.isIntersecting) {
                                    const n = e(t);
                                    "function" == typeof n
                                        ? a.set(t.target, n)
                                        : l.unobserve(t.target);
                                } else n && (n(t), a.delete(t.target));
                        });
                    },
                    {
                        root: n,
                        rootMargin: i,
                        threshold: "number" == typeof r ? r : li[r],
                    }
                );
            return o.forEach((t) => l.observe(t)), () => l.disconnect();
        }),
        (t.inertia = Ge),
        (t.interpolate = vn),
        (t.invariant = n),
        (t.isDragActive = function () {
            return i;
        }),
        (t.keyframes = wn),
        (t.mirrorEasing = Mt),
        (t.mix = yn),
        (t.motionValue = v),
        (t.noop = e),
        (t.pipe = sn),
        (t.progress = T),
        (t.reverseEasing = Pt),
        (t.scroll = function (t, { axis: n = "y", ...s } = {}) {
            const i = { axis: n, ...s };
            return "function" == typeof t
                ? (function (t, e) {
                      return (function (t) {
                          return 2 === t.length;
                      })(t) || ai(e)
                          ? si((n) => {
                                t(n[e.axis].progress, n);
                            }, e)
                          : ii(t, oi(e));
                  })(t, i)
                : (function (t, n) {
                      if ((t.flatten(), ai(n)))
                          return (
                              t.pause(),
                              si((e) => {
                                  t.time = t.duration * e[n.axis].progress;
                              }, n)
                          );
                      {
                          const s = oi(n);
                          return t.attachTimeline
                              ? t.attachTimeline(
                                    s,
                                    (t) => (
                                        t.pause(),
                                        ii((e) => {
                                            t.time = t.duration * e;
                                        }, s)
                                    )
                                )
                              : e;
                      }
                  })(t, i);
        }),
        (t.scrollInfo = si),
        (t.spring = q),
        (t.stagger = function (
            t = 0.1,
            { startDelay: e = 0, from: n = 0, ease: s } = {}
        ) {
            return (i, r) => {
                const o =
                        "number" == typeof n
                            ? n
                            : (function (t, e) {
                                  if ("first" === t) return 0;
                                  {
                                      const n = e - 1;
                                      return "last" === t ? n : n / 2;
                                  }
                              })(n, r),
                    a = Math.abs(o - i);
                let l = t * a;
                if (s) {
                    const e = r * t;
                    l = en(s)(l / e) * e;
                }
                return e + l;
            };
        }),
        (t.steps = function (t, e = "end") {
            return (n) => {
                const s =
                        (n =
                            "end" === e
                                ? Math.min(n, 0.999)
                                : Math.max(n, 0.001)) * t,
                    i = "end" === e ? Math.floor(s) : Math.ceil(s);
                return P(0, 1, i / t);
            };
        }),
        (t.sync = ci),
        (t.transform = function (...t) {
            const e = !Array.isArray(t[0]),
                n = e ? 0 : -1,
                s = t[0 + n],
                i = t[1 + n],
                r = t[2 + n],
                o = t[3 + n],
                a = vn(i, r, {
                    mixer:
                        ((l = r[0]),
                        ((t) => t && "object" == typeof t && t.mix)(l)
                            ? l.mix
                            : void 0),
                    ...o,
                });
            var l;
            return e ? a(s) : a;
        }),
        (t.wrap = st);
});
