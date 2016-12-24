const Entities = require("../src/entities");
const EntityType = require("../src/entities/type");

const {_TYPE, _X, _Y,_DX,_DY, _SIZE_OF, _START} = require("../src/entities/constants");

var assert = require("power-assert");

describe("Entities", function(){
    it("allocates entities", function()
    {
        Entities.clear();

        var array = Entities.getArray();
        assert(array[_TYPE] === EntityType.NONE);

        for (var i=0; i < 10; i++)
        {
            var id = Entities.create(EntityType.BONUS, i, i);
            assert(id === i * _SIZE_OF);

            assert(array[id + _TYPE] === EntityType.BONUS);
            assert(array[id + _X] === i);
            assert(array[id + _Y] === i);
        }

    });

    it("removes entities and reissues ids", function()
    {
        var array = Entities.getArray();
        assert(array[_TYPE] === EntityType.BONUS);
        Entities.remove(0);
        assert(array[_TYPE] === EntityType.NONE);

        // 0 is reissued, then count grows
        assert(Entities.create(EntityType.ROCKET, 1,2) === 0);
        assert(Entities.create(EntityType.ROCKET, 2,3) === 10 * _SIZE_OF);

        // remove 3
        Entities.remove(1 * _SIZE_OF);
        Entities.remove(3 * _SIZE_OF);
        Entities.remove(5 * _SIZE_OF);

        // reissued in decreasing order, then count grows
        assert(Entities.create(EntityType.ROCKET, 4,5) === 5 * _SIZE_OF);
        assert(Entities.create(EntityType.ROCKET, 5,6) === 3 * _SIZE_OF);
        assert(Entities.create(EntityType.ROCKET, 6,7) === 1 * _SIZE_OF);
        assert(Entities.create(EntityType.ROCKET, 7,8) === 11 * _SIZE_OF);

        // remove 3 again in other order
        Entities.remove(3 * _SIZE_OF);
        Entities.remove(5 * _SIZE_OF);
        Entities.remove(1 * _SIZE_OF);

        // reissued in decreasing order, then count grows
        assert(Entities.create(EntityType.ROCKET, 4,5) === 5 * _SIZE_OF);
        assert(Entities.create(EntityType.ROCKET, 5,6) === 3 * _SIZE_OF);
        assert(Entities.create(EntityType.ROCKET, 6,7) === 1 * _SIZE_OF);
        assert(Entities.create(EntityType.ROCKET, 7,8) === 12 * _SIZE_OF);

    });

});
