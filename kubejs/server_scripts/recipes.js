// priority: 0

var seed
var log = []

// Mod shortcuts
let MOD = (domain, id, x) => (x ? `${x}x ` : "") + (id.startsWith('#') ? '#' : "") + domain + ":" + id.replace('#', '')
let CR = (id, x) => MOD("create", id, x)
let MC = (id, x) => MOD("minecraft", id, x)
let KJ = (id, x) => MOD("kubejs", id, x)
let FD = (id, x) => MOD("farmersdelight", id, x)
let F = (id, x) => MOD("forge", id, x)
let AC = (id, x) => MOD("aquaculture", id, x)
let GS = (id, x) => MOD("garnished", id, x)
let QK = (id, x) => MOD("quark", id, x)
let DE = (id, x) => MOD("destroy", id, x)
let BC = (id, x) => MOD("createbigcannons", id, x)
let OE = (id, x) => MOD("createoreexcavation", id, x)
let CME = (id, x) => MOD("create_mechanical_extruder", id, x)
let DG = (id, x) => MOD("createdieselgenerators", id, x)
let NA = (id, x) => MOD("create_new_age", id, x)
let EI = (id, x) => MOD('create_enchantment_industry', id, x)
let VR = (id, x) => MOD("vinery", id, x)
let NVR = (id, x) => MOD("nethervinery", id, x)
let CU = (id, x) => MOD("createutilities", id, x)

let wood_types = [MC('oak'), MC('spruce'), MC('birch'), MC('jungle'), MC('acacia'), MC('dark_oak'), MC('crimson'), MC('warped')]


function cobblegen(event, output, adjacent, below, bonks) {
    event.recipes.createMechanicalExtruderExtruding(
        Item.of(output),
        adjacent
    ).withCatalyst(below).requiredBonks(bonks);
}

function algalAndesite(event) {
	event.remove({ id: CR('crafting/materials/andesite_alloy') })
	event.remove({ id: CR('crafting/materials/andesite_alloy_from_zinc') })
	event.remove({ id: CR('mixing/andesite_alloy') })
	event.remove({ id: CR('mixing/andesite_alloy_from_zinc') })

	event.smelting(KJ('algal_brick'), KJ('algal_blend')).xp(0).cookingTime(120)

	event.shaped(Item.of(KJ('algal_blend'), 4), [
		'SS',
		'AA'
	], {
		A: 'minecraft:clay_ball',
		S: ['minecraft:kelp', 'minecraft:seagrass']
	})
	event.shaped(Item.of(KJ('algal_blend'), 4), [
		'AA',
		'SS'
	], {
		A: 'minecraft:clay_ball',
		S: ['minecraft:kelp', 'minecraft:seagrass']
	})
	event.shaped(Item.of(CR('andesite_alloy'), 2), [
		'SS',
		'AA'
	], {
		A: ['minecraft:andesite', CR('andesite_cobblestone')],
		S: KJ('algal_brick')
	})
	event.shaped(Item.of(CR('andesite_alloy'), 2), [
		'AA',
		'SS'
	], {
		A: ['minecraft:andesite', CR('andesite_cobblestone')],
		S: KJ('algal_brick')
	})

	event.recipes.createMixing(Item.of(KJ('algal_blend'), 2), ['minecraft:clay_ball', ['minecraft:kelp', 'minecraft:seagrass']])
	event.recipes.createMixing(Item.of(CR('andesite_alloy'), 2), [KJ('algal_brick'), ['minecraft:andesite', CR('andesite_cobblestone')]])
}

function corundumAssemblyAll(event) {
    function corundum_assembly(event, color, dye) {
        let corundum_id = QK(`${color}_corundum`)
        let inter = QK('white_corundum_pane') //test
        event.recipes.create.sequenced_assembly([
            Item.of(corundum_id)
        ], QK('white_corundum'), [
            event.recipes.createDeploying(inter, [inter, dye]),
            event.recipes.createPressing(inter, inter),
            event.recipes.createFilling(inter, [inter, Fluid.lava(500)]),
            event.recipes.createPressing(inter, inter)
        ]).transitionalItem(inter).loops(2)
    }
    let color_dye = [
        {"color":"red", "dye":'red_dye'},
        {"color":"yellow", "dye":'yellow_dye'},
        {"color":"indigo", "dye":'blue_dye'},
        {"color":"violet", "dye":'magenta_dye'},
        {"color":"black", "dye":'black_dye'},
        {"color":"blue", "dye":'light_blue_dye'},
        {"color":"green", "dye":'green_dye'}
    ]
    color_dye.forEach(function (item){
        corundum_assembly(event, item['color'], MC(item['dye']))
    })
}

function andesiteMachine(event) {
    event.replaceInput({ id: CR("crafting/kinetics/brass_hand") }, '#forge:plates/brass', CR('golden_sheet'))
	wood_types.forEach(wood => {
		event.recipes.createCutting('2x ' + wood + '_slab', wood + '_planks').processingTime(150)
	})
    let transitional = 'kubejs:incomplete_kinetic_mechanism'
	event.recipes.createSequencedAssembly([
		'kubejs:kinetic_mechanism',
	], '#minecraft:wooden_slabs', [
		event.recipes.createDeploying(transitional, [transitional, CR('andesite_alloy')]),
		event.recipes.createDeploying(transitional, [transitional, CR('andesite_alloy')]),
		event.recipes.createDeploying(transitional, [transitional, F('#saws')])
	]).transitionalItem(transitional)
		.loops(1)
		.id('kubejs:kinetic_mechanism')

        event.shapeless(KJ('kinetic_mechanism'), [F('#saws'), CR('cogwheel'), CR('andesite_alloy'), '#minecraft:logs']).id("kubejs:kinetic_mechanism_manual_only")

    // Andesite
	event.shaped(KJ('andesite_machine'), [
		'SSS',
		'SCS',
		'SSS'
	], {
		C: CR('andesite_casing'),
		S: KJ('kinetic_mechanism')
	})

	let andesite_machine = (id, amount, other_ingredient) => {
		event.remove({ output: id })
		if (other_ingredient) {
			event.smithing(Item.of(id, amount), MC('slime_ball'), 'kubejs:andesite_machine', other_ingredient)
			event.recipes.createMechanicalCrafting(Item.of(id, amount), "AB", { A: 'kubejs:andesite_machine', B: other_ingredient })
		}
		else
			event.stonecutting(Item.of(id, amount), 'kubejs:andesite_machine')
	}

    andesite_machine(CR('portable_storage_interface'), 2)
    andesite_machine(CR('mechanical_drill'), 1, OE('drill'))
    andesite_machine(CR('encased_fan'), 1, CR('propeller'))
    andesite_machine(CR('mechanical_press'), 1, MC('iron_block'))
    andesite_machine(CME('mechanical_extruder'), 1, MC('lava_bucket'))
    andesite_machine(CR('mechanical_plough'), 2)
    andesite_machine(CR('mechanical_saw'), 1, KJ('iron_saw'))
    andesite_machine(CR('deployer'), 1, CR('brass_hand'))
    andesite_machine(CR('mechanical_harvester'), 2)
    andesite_machine(CR('andesite_funnel'), 4)
    andesite_machine(CR('andesite_tunnel'), 4)
    andesite_machine(CR('mechanical_mixer'), 1, CR('whisk'))
}

function eternalProduction(event) {
  // Eternal ingot and grains
  event.recipes.create.mixing(KJ('eternal_ingot'), [
    MC('calcite'), MC('stone'), MC('deepslate'), MC('tuff'), MC('andesite'), MC('diorite'), MC('granite'), NA('thorium', 32)])
    .superheated().id('kuboross:eternal_production')

  event.recipes.create.crushing([KJ('eternal_ingot'), KJ('grain_of_infinity')], KJ('eternal_ingot'))
  event.recipes.create.milling([KJ('eternal_ingot'), KJ('grain_of_infinity')], KJ('eternal_ingot'))
  event.recipes.create.mixing(Fluid.of(KJ('abyssal_blend'), 1000), [Fluid.water(1000), KJ('grain_of_infinity')])
  // Infinite white corundum cluster
  event.recipes.create.milling(KJ('corundum_dust'), QK('white_corundum_cluster'))
  event.recipes.create.crushing(KJ('corundum_dust'), QK('white_corundum_cluster'))
  event.recipes.shapeless(KJ('corundum_seed_1', 2), [KJ('corundum_dust'), MC('sand')])
  event.recipes.create.mixing(KJ('corundum_seed_1', 2), [KJ('corundum_dust'), MC('sand')])
  let t1 = KJ('corundum_seed_1')
  let t2 = KJ('corundum_seed_2')
  let t3 = KJ('corundum_seed_3')

  event.recipes.create.sequenced_assembly([
    KJ('corundum_seed_2')
  ], KJ('corundum_seed_1'), [
    event.recipes.create.filling(t1, [t1, Fluid.water(1000)])
  ]
  ).transitionalItem(t1).loops(4)

  event.recipes.create.sequenced_assembly([
    KJ('corundum_seed_3')
  ], KJ('corundum_seed_2'), [
    event.recipes.create.filling(t2, [t2, Fluid.water(1000)])
  ]
  ).transitionalItem(t2).loops(4)

  event.recipes.create.sequenced_assembly([
    QK('white_corundum_cluster')
  ], KJ('corundum_seed_3'), [
    event.recipes.create.filling(t3, [t3, Fluid.water(1000)])
  ]
  ).transitionalItem(t3).loops(4)
  event.custom({
    "type": "create_new_age:energising",
    "energy_needed": 5000,
    "ingredients": [
      {"item": QK('white_corundum_cluster')}],
    "results": [
      {"item": KJ('overcharged_white_corundum_cluster')}
  ]})
  event.recipes.create.mixing(
    [Fluid.of(DE('molten_cinnabar'), 333), QK('white_corundum_cluster')],
    [KJ('overcharged_white_corundum_cluster'), Fluid.of(KJ('abyssal_blend'), 333)] )
}

function brassMachine(event) {
    event.recipes.create.mixing(CR('polished_rose_quartz'), [QK('white_corundum_cluster'), Fluid.of(DE('molten_cinnabar'), 100)])
    event.recipes.createFilling(CR('electron_tube'), [CR('polished_rose_quartz'), Fluid.of(BC('molten_cast_iron'), 10)])
    event.remove({ id: CR("sequenced_assembly/precision_mechanism") })

    let t = CR('incomplete_precision_mechanism')
	event.recipes.createSequencedAssembly([
		CR('precision_mechanism'),
	], KJ('kinetic_mechanism'), [
		event.recipes.createDeploying(t, [t, CR('electron_tube')]),
		event.recipes.createDeploying(t, [t, CR('electron_tube')]),
		event.recipes.createDeploying(t, [t, F('#screwdrivers')])
	]).transitionalItem(t)
		.loops(1)
		.id('kubejs:precision_mechanism')

    event.shaped(KJ('brass_machine'), [
        'SSS',
        'SCS',
        'SSS'
    ], {
        C: CR('brass_casing'),
        S: CR('precision_mechanism')
    })
    
    let brass_machine = (id, amount, other_ingredient) => {
        event.remove({ output: id })
        if (other_ingredient) {
            event.smithing(Item.of(id, amount), MC('slime_ball'), 'kubejs:brass_machine', other_ingredient)
            event.recipes.createMechanicalCrafting(Item.of(id, amount), "AB", { A: 'kubejs:brass_machine', B: other_ingredient })
        }
        else
            event.stonecutting(Item.of(id, amount), 'kubejs:brass_machine')
    }

    brass_machine('create:mechanical_crafter', 3, MC('crafting_table'))
    brass_machine('create:sequenced_gearshift', 2)
    brass_machine('create:steam_engine', 1, MC('copper_block'))
    brass_machine('create:rotation_speed_controller', 1)
    brass_machine('create:mechanical_arm', 1)
    brass_machine('create:stockpile_switch', 2)
	brass_machine('create:content_observer', 2)
    brass_machine('create:brass_funnel', 4)
	brass_machine('create:brass_tunnel', 4)
}

function invarMachine(event) {
    event.shapeless(KJ('nickel_compound'), [DE('nickel_ingot'), DE("iron_powder"), DE("iron_powder"), DE("iron_powder"), DE("iron_powder")])
    event.blasting(KJ('invar_compound'), KJ('nickel_compound'))
    let s = KJ('invar_compound')
    event.recipes.createSequencedAssembly([
		KJ('invar_ingot'),
	], KJ('invar_compound'), [
		event.recipes.createPressing(s, s)
	]).transitionalItem(s)
		.loops(16)
		.id('kubejs:invar_ingot')

    let t = KJ('incomplete_radiant_sheet')
    event.recipes.createSequencedAssembly([
		KJ('radiant_sheet'),
	], NA('overcharged_golden_sheet'), [
		event.recipes.createDeploying(t, [t, MC('amethyst_shard')]),
        event.recipes.createPressing(t, t)
	]).transitionalItem(t)
		.loops(2)
		.id(KJ('radiant_sheet'))
    event.recipes.create.mechanical_crafting(KJ('radiant_coil'), KJ('radiant_sheet'))

    event.custom({
        "type": "create_new_age:energising",
        "energy_needed": 5000,
        "ingredients": [
          {"item": QK('red_corundum_cluster')}],
        "results": [
          {"item": KJ('overcharged_red_corundum_cluster')}
    ]})

    event.custom({
        "type": "create_new_age:energising",
        "energy_needed": 5000,
        "ingredients": [
          {"item": QK('blue_corundum_cluster')}],
        "results": [
          {"item": KJ('overcharged_blue_corundum_cluster')}
    ]})

    event.custom({
        "type": "create:item_application",
        "ingredients": [
          {
            "item": MC('stone')
          },
          {
            "item": KJ('invar_ingot')
          }
        ],
        "results": [
          {
            "item": KJ('invar_casing')
          }
        ]
      })

    let j = KJ('incomplete_inductive_mechanism')
	event.recipes.createSequencedAssembly([
		KJ('inductive_mechanism'),
	], CR('precision_mechanism'), [
		event.recipes.createDeploying(j, [j, KJ('radiant_coil')]),
		event.recipes.createDeploying(j, [j, KJ('radiant_coil')]),
		event.recipes.createDeploying(j, [j, KJ('chromatic_resonator')])
	]).transitionalItem(j)
		.loops(1)
		.id('kubejs:inductive_mechanism')

	event.shaped(KJ('machine_frame'), [
		'SSS',
		'SCS',
		'SSS'
	], {
		C: KJ('invar_casing'),
		S: KJ('inductive_mechanism')
	})

    let invar_machine = (id, amount, other_ingredient) => {
		event.remove({ output: id })
		if (other_ingredient) {
			event.smithing(Item.of(id, amount), MC('slime_ball'), KJ('machine_frame'), other_ingredient)
			event.recipes.createMechanicalCrafting(Item.of(id, amount), "AB", { A: KJ('machine_frame'), B: other_ingredient })
		}
		else
			event.stonecutting(Item.of(id, amount), KJ('machine_frame'))
	}

    invar_machine(OE('drilling_machine'), 1, OE('netherite_drill'))
    invar_machine(EI('printer'), 1, CR('hose_pulley'))
}

function elytraEbat(event) {
    // Mechanical core
    event.recipes.create.mechanical_crafting(KJ('mechanical_core'), [
        ' CCC ',
        'CGDGC',
        'CNSNC',
        'CIEIC',
        ' CCC '
    ], {
        C: KJ('invar_casing'),
        G: CR('steam_engine'),
        D: DE('differential'),
        N: DG('engine_piston'),
        S: QK('slime_in_a_bucket'),
        I: KJ('inductive_mechanism'),
        E: DG('engine_silencer')
    })
    // Living core
    event.recipes.create.mixing(KJ('living_core'), 
    [VR('creepers_crush'), VR('villagers_fright'), NVR('netherite_nectar'), Fluid.of(EI('hyper_experience'), 1000)]).superheated()

    event.recipes.create.mechanical_crafting(MC('elytra'), [
        'PMP',
        'PLP',
        'VNV'
    ], {
        P:MC('phantom_membrane'),
        M:KJ('mechanical_core'),
        L:KJ('living_core'),
        V:CU('void_steel_ingot'),
        N:MC('nether_star')
    })
}

function toolsRecipes(event) {
    event.recipes.create.mixing(QK('white_corundum'), [QK('clear_shard', 2), MC('diorite', 2)]).heated()
    event.shaped(KJ('iron_saw'), [
		'SSS',
		'SCN'
	], {
		C: MC('iron_ingot'),
		S: MC('stick'),
        N: DG('kelp_handle')
	})
    event.shaped(KJ('screwdriver'), [
        'S ',
        ' N'], {
            S: MC('iron_ingot'),
            N: DG('kelp_handle')
        }
    )
    event.shaped(KJ('chromatic_resonator'), [
        'S N',
        'I I',
        ' I '
    ], {
        S:KJ('overcharged_red_corundum_cluster'),
        N:KJ('overcharged_blue_corundum_cluster'),
        I:CR('iron_sheet')
    })
}

function tweaks(event) {
    // Casting fluids
    let t = MC('iron_ingot')
    event.recipes.create.sequenced_assembly([
        KJ('cast_ingot')
    ], MC('iron_ingot'), [
        event.recipes.create.filling(t, [t, Fluid.of(MC('lava'), 500)]),
        event.recipes.create.pressing(t, t)
    ]).transitionalItem(t).loops(4)

    event.recipes.create.deploying(KJ('sand_ingot_cast'), [MC('sand'), KJ('cast_ingot')])

    // redstone production tweak
    event.remove({id: 'create:filling/redstone'})
    event.recipes.createFilling(MC('redstone'), [
        Fluid.of('create:potion', 50, {Potion: "minecraft:healing"}),
        'create:cinder_flour'])

    // Copper
    event.custom({
        "type": "createbigcannons:melting",
        "ingredients": [
          {
            "item": MC('copper_ingot')
          }
        ],
        "results": [
          {
            "fluid": "kubejs:molten_copper",
            "amount": 90
          }
        ],
        "processingTime": 180,
        "heatRequirement": "heated",
    })

    // Tin
    event.recipes.create.mixing([GS('crushed_shroomlight', 3), Fluid.of(KJ('molten_tin'), 270)], MC('glowstone')).superheated()
    event.shapeless(KJ('tin_ingot'), KJ('tin_nugget', 9))
    event.shapeless(KJ('tin_nugget', 9), KJ('tin_ingot'))
    event.custom({
        "type": "createbigcannons:melting",
        "ingredients": [
          {
            "item": KJ('tin_ingot')
          }
        ],
        "results": [
          {
            "fluid": "kubejs:molten_tin",
            "amount": 90
          }
        ],
        "processingTime": 180,
        "heatRequirement": "heated",
    })
    event.recipes.create.filling(Item.of(KJ('tin_ingot')), [KJ('sand_ingot_cast'), Fluid.of(KJ('molten_tin'), 90)])

    // Steel
    event.remove({id: BC('melting/melt_steel_ingot')})
    event.remove({id: BC('melting/melt_steel_block')})
    event.shapeless(KJ('steel_ingot'), BC('steel_scrap', 9))
    event.shapeless(BC('steel_scrap', 9), KJ('steel_ingot'))
    event.custom({
        "type": "createbigcannons:melting",
        "ingredients": [
          {
            "item": KJ('steel_ingot')
          }
        ],
        "results": [
          {
            "fluid": "createbigcannons:molten_steel",
            "amount": 90
          }
        ],
        "processingTime": 180,
        "heatRequirement": "heated",
    })
    event.recipes.create.filling(Item.of(KJ('steel_ingot')), [KJ('sand_ingot_cast'), Fluid.of(BC('molten_steel'), 90)])
    let x = NA('overcharged_iron')
    event.recipes.create.sequenced_assembly([
        KJ('steel_ingot')
    ], NA('overcharged_iron'), [
        event.recipes.create.deploying(x, [x, KJ('coal_dust')]),
        event.recipes.create.pressing(x, x),
        event.recipes.create.pressing(x, x),
        event.recipes.create.pressing(x, x)
    ]).transitionalItem(t).loops(4)

    // Bronze
    event.recipes.create.mixing(
        Fluid.of(BC('molten_bronze'), 180), 
        [Fluid.of(KJ('molten_tin'), 90), Fluid.of(KJ('molten_copper'), 90)])
    event.remove({id: BC('melting/melt_bronze_ingot')})
    event.remove({id: BC('melting/melt_bronze_block')})
    event.shapeless(KJ('bronze_ingot'), BC('bronze_scrap', 9))
    event.shapeless(BC('bronze_scrap', 9), KJ('bronze_ingot'))
    event.custom({
        "type": "createbigcannons:melting",
        "ingredients": [
          {
            "item": KJ('bronze_ingot')
          }
        ],
        "results": [
          {
            "fluid": "createbigcannons:molten_bronze",
            "amount": 90
          }
        ],
        "processingTime": 180,
        "heatRequirement": "heated",
    })
    event.recipes.create.filling(Item.of(KJ('bronze_ingot')), [KJ('sand_ingot_cast'), Fluid.of(BC('molten_bronze'), 90)])

    // Custom
    event.recipes.create.crushing(KJ('coal_dust'), MC('coal'))
    event.remove('createdeco:compacting/industrial_iron_ingot')
    event.blasting('createdeco:industrial_iron_ingot', MC('iron_ingot'))
    event.remove(QK('tweaks/crafting/elytra_duplication'))
    event.recipes.create.splashing(MC('clay_ball', 2), MC('mud'))
    event.recipes.create.milling(Item.of(MC('sand')).withChance(0.25), MC('gravel'))
}

ServerEvents.recipes(event => {
    algalAndesite(event)
    elytraEbat(event)
    eternalProduction(event)
    tweaks(event)
    toolsRecipes(event)
    corundumAssemblyAll(event)
    andesiteMachine(event)
    brassMachine(event)
    invarMachine(event)
    cobblegen(event, MC("andesite"), [MC('lava'), MC('water')], MC('bedrock'), 1)
    cobblegen(event, MC("granite"), [MC('lava'), GS('red_mastic_resin')], MC('bedrock'), 1)
    cobblegen(event, MC("diorite"), [MC('lava'), MC('water')], MC('nether_quartz_ore'), 1)
    cobblegen(event, MC("mud"), [MC('water'), MC('water')], MC('dirt'), 1)
})

ServerEvents.tags('item', event => {
	event.add(F('saws'),"kubejs:iron_saw")
    event.add(F("screwdrivers"), "kubejs:screwdriver")
})