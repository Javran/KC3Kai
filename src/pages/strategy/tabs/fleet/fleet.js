(function(){
	"use strict";
	
	KC3StrategyTabs.fleet = new KC3StrategyTab("fleet");
	
	KC3StrategyTabs.fleet.definition = {
		tabSelf: KC3StrategyTabs.fleet,
		
		fleets: [],

		/*
		  "fleets" object format:
		  * an array of "fleet" objects
		  * length is exactly 4, falsy value for non-existing fleet (null is recommended)
		  
		  "fleet" object format:
		  { ships: <an array of "ship" objects>
		  ( length is exactly 6, falsy value for non-existing ship (null is recommended) )
		  , name: <fleet name> (optional)
		  }

		  "ship" object format:
		  { id: <ship master id>
		  , level: <ship level>
		  , luck: <ship luck> (optional)
		  , equipments: <array of equipments, length = 5 (4+1), falsy for non-existing>
		  }
		  
		  "equipment" object format:
		  { id: <equipment master id>
		  , ace: <aircraft proficiency> (optional) (-1 if "ace" is not applicable)
		  , improve: <improvement level> (optional)
		  }
		  
		 */
		
		/* INIT
		   Prepares all data needed
		   ---------------------------------*/
		init :function(){
			PlayerManager.loadFleets();
			
		},
		
		/* EXECUTE
		   Places data onto the interface
		   ---------------------------------*/
		execute :function(){
			// Empty fleet list
			$(".tab_fleet .fleet_list").html("");
			
			this.loadCurrentFleets();

			// Execute fleet fill
			this.showFleet( 0, PlayerManager.fleets[0] );
			this.showFleet( 1, PlayerManager.fleets[1] );
			this.showFleet( 2, PlayerManager.fleets[2] );
			this.showFleet( 3, PlayerManager.fleets[3] );
		},

		loadCurrentFleets: function() {

			var fleetsObj = [];

			function convertEquipmentsOf(ship) {
				var equipments = [];
				$.each([0,1,2,3], function(_,ind) {
					equipments.push( ship.equipment(ind) );
				});
				equipments.push( ship.exItem() );

				function convertEquipment(e) {
					if (e.masterId === 0)
						return null;
					return {
						id: e.masterId,
						ace: e.ace,
						improve: e.stars
					};
				}

				return equipments.map( convertEquipment );
			}

			function convertFleet(fleet) {
				if (!fleet || !fleet.active) return null;
				console.log(fleet);
				var fleetObjShips = [];
				$.each([0,1,2,3,4,5], function(_,ind) {
					var ship = fleet.ship(ind);
					if (ship.masterId === 0) {
						fleetObjShips.push( null );
						return;
					}
					var shipObj = {
						id: ship.masterId,
						level: ship.level,
						luck: ship.lk[0],
						equipment: convertEquipmentsOf(ship)
					};

					fleetObjShips.push( shipObj );
				});
				var fleetObj = {
					name: fleet.name,
					ships: fleetObjShips
				};
				console.log( JSON.stringify( fleetObj ) );

				return fleetObj;
			}

			PlayerManager.loadFleets();
			$.each([0,1,2,3], function(_,ind) {
				fleetsObj.push(convertFleet( PlayerManager.fleets[ind] ));
			});

			return fleetsObj;
		},
		
		/* Show single fleet
		   --------------------------------------------*/
		showFleet :function( index, fleetObj ){
			if(!fleetObj.active){ return false;}
			
			// Create fleet box
			var fleetBox = $(".tab_fleet .factory .fleet_box").clone().appendTo(".tab_fleet .fleet_list");
			fleetBox.attr("id", "fleet_box"+index);
			$(".fleet_name", fleetBox).text( fleetObj.name );
			
			// Add ships to fleet box
			for(var shipCtr in fleetObj.ships){
				if(fleetObj.ships[shipCtr] > -1){
					this.showShip( fleetBox , fleetObj.ships[shipCtr]);
				}
			}
			
			// Show fleet info
			$(".detail_level .detail_value", fleetBox).text( fleetObj.totalLevel() );
			$(".detail_los2 .detail_value", fleetBox).text( Math.round( fleetObj.eLos2() * 100) / 100 );
			$(".detail_los3 .detail_value", fleetBox).text( Math.round( fleetObj.eLos3() * 100) / 100 );
			$(".detail_air .detail_value", fleetBox).text( fleetObj.fighterPowerText() );
			$(".detail_speed .detail_value", fleetBox).text( fleetObj.speed() );
		},
		
		/* Show single ship
		   --------------------------------------------*/
		showShip :function( fleetBox, ship_id ){
			// If ship exists on current list
			if(KC3ShipManager.get(ship_id) !== false){
				var thisShip = KC3ShipManager.get(ship_id);
				var masterShip = thisShip.master();
				
				var shipBox = $(".tab_fleet .factory .fleet_ship").clone().appendTo("#"+fleetBox.attr("id")+" .fleet_ships");
				$(".ship_type", shipBox).text( thisShip.stype() );
				$(".ship_pic img", shipBox).attr("src", KC3Meta.shipIcon( thisShip.masterId ) );
				$(".ship_lv_val", shipBox).text( thisShip.level );
				$(".ship_name", shipBox).text( thisShip.name() );
				
				this.showEquip( $(".ship_gear_1", shipBox), thisShip.items[0], thisShip.slots[0] );
				this.showEquip( $(".ship_gear_2", shipBox), thisShip.items[1], thisShip.slots[1] );
				this.showEquip( $(".ship_gear_3", shipBox), thisShip.items[2], thisShip.slots[2] );
				this.showEquip( $(".ship_gear_4", shipBox), thisShip.items[3], thisShip.slots[3] );
			}
		},
		
		/* Show single equipment
		   --------------------------------------------*/
		showEquip :function( gearBox, gear_id, capacity){
			if(gear_id > -1){
				var thisItem = KC3GearManager.get(gear_id);
				var masterItem = thisItem.master();
				
				$("img", gearBox).attr("src", "../../assets/img/items/"+masterItem.api_type[3]+".png");
				$(".gear_name", gearBox).text( thisItem.name() );
			}else{
				gearBox.hide();
			}
		}
		
	};
	
})();
