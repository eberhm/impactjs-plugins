/**
 * This Entity works as the base Entity for platforms.
 * To make use of it just extend it with at least the following attributes:
 *
 * animSheet: the animation sheet the entity will use. This is always required
 * by the weltmeister editor
 * size: the size of the platform
 *
 * In the weltmeister editor or then at runtime you can set the route and platformType.
 *
 * route: string defining the platform movement. Example route '50-r|50-l|10-u|10-d'. The | symbol
 * separates single routes and the - symbol separates between length and direction. Possible directions are
 * u(up) d(down) r(right) and l(left). Length is in pixels.
 *
 * platformType: defines the platform behaviour after completing all the routes. Possibles values:
 * 'respawn'  : the entity re-spawns itself again at the initial point. Typical for vertical gaps, etc
 * 'linear'   : the entity kills itself after completing all th routes
 * 'circular' : the platform will rerun all the routes from the current position.
 *
 * doInit: this function can be overwritten if you need to hook some functionality to the init function.
 * Overwrite directly init function is highly discouraged
 * endRouteAnim: this function is a hook for if you want to have a custom animation at the end of
 * the route (platform explosion, etc).
 *
 *
 * If a route collides with the collision map, it skips to the next route
 */
ig.module('game.entities.platform')
    .requires('impact.entity')
    .defines(function() {
        EntityPlatform = ig.Entity.extend({
            animSheet: null,
            size: null,
            route: "",
            vel: {x:0,y:0},
            maxVel:{x: 30, y: 20},
            gravityFactor: 0,
            checkAgainst: ig.Entity.TYPE.BOTH,
            collides: ig.Entity.COLLIDES.FIXED,
            routes: [],
            currentRoute: 0,
            platformType: 'circular',
            className: '',
            endRouteAnim: function() {},
            init: function(x, y, settings) {
                this.parent(x, y, settings);
                this.doInit();
                this.initPos = this.lastPos = {x: x, y: y};
                this.iniSettings = settings;
                this.initRoutes();
            },
            doInit: function() {
                this.addAnim('idle', 0.2, [1]);
            },
            initRoutes: function() {
                var routes = this.route.split('|'),
                    l = routes.length, i, routerFn;

                for(i=0; i < l; i++) {
                    routerFn = this.getRouterFn(routes[i]);
                    if (routerFn) {
                        this.routes.push(routerFn);
                    }
                }
            },
            handleMovementTrace: function(res) {
                this.parent(res);

                if (res.collision.x || res.collision.y) {
                    this.currentRoute++;
                }
            },
            getRouterFn: function(el) {
                var aRoute = el.split('-'),
                    routeFn, self= this;

                switch (aRoute[1]) {
                    case 'r':
                        routeFn = function(pos) {
                            if (pos.x <= self.lastPos.x + parseInt(aRoute[0])) {
                                self.vel.x = self.maxVel.x;
                                self.vel.y = 0;
                            } else {
                                self.traceRoute(true);
                            }
                        };
                        break;
                    case 'l':
                        routeFn = function(pos) {
                            if (pos.x >= self.lastPos.x - parseInt(aRoute[0])) {
                                self.vel.x = -self.maxVel.x;
                                self.vel.y = 0;
                            } else {
                                self.traceRoute(true);
                            }
                        };
                        break;
                    case 'u':
                        routeFn = function(pos) {
                            if (pos.y >= self.lastPos.y - parseInt(aRoute[0])) {
                                self.vel.y = -self.maxVel.y;
                                self.vel.x = 0;
                            } else {
                                self.traceRoute(true);
                            }
                        };
                        break;
                    case 'd':
                        routeFn = function(pos) {
                            if (pos.y <= self.lastPos.y + parseInt(aRoute[0])) {
                                self.vel.y = self.maxVel.y;
                                self.vel.x = 0;
                            } else {
                                self.traceRoute(true);
                            }
                        };
                        break;
                    default:
                        routeFn = null;
                        break;
                }

                return routeFn;
            },
            update: function() {
                this.traceRoute();
                this.parent();
            },
            traceRoute: function(nextRoute) {
                if (this.currentRoute >= this.routes.length) {
                    this.endRouteAnim();
                    switch (this.platformType) {
                        case EntityPlatform.TYPE.CIRCULAR:
                            this.currentRoute = 0;
                            break;
                        case EntityPlatform.TYPE.RESPAWN:
                            if (this.className) {
                                this.kill();
                                ig.game.spawnEntity(this.className, this.initPos.x, this.initPos.y, this.iniSettings);
                            }
                            break;
                        case EntityPlatform.TYPE.LINEAR:
                            this.kill();
                            break;
                    }
                }

                if (nextRoute) {
                    this.currentRoute++;
                    this.lastPos = this.pos;
                }

                if (this.routes[this.currentRoute] instanceof Function) {
                    this.routes[this.currentRoute].call(this, this.pos);
                }
            }
        });

        EntityPlatform.TYPE = {
            CIRCULAR    : 'circular',
            RESPAWN     : 'respawn',
            LINEAR      : 'linear'
        }
    });