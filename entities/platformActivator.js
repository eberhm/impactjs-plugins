ig.module('plugins.entities.platformActivator')
.requires('impact.entity')
.defines(function() {
    EntityPlatformActivator = ig.Entity.extend({
        checkAgainst: ig.Entity.TYPE.A,
        _wmDrawBox: true,
        _wmColor: 'rgba(255, 0, 0, 0.7)',
        size: {x: 8, y: 8},
        platformName: 1,
        check: function(other) {
            var self = this;
            if (other instanceof EntityPlayer) {
                ig.game.getEntityByName(this.platformName).resume();
                this.kill();
            }
        }
    });
});