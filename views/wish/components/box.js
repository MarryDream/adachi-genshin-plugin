const template = `<div class="wish-box">
	<img class="box-background" :src="boxBackground" alt="ERROR"/>
	<div class="character" v-if="d.type === '角色'">
		<img class="main" :src="mainImage" alt="ERROR"/>
		<img class="type" :src="typeIcon" alt="ERROR"/>
	</div>
	<div class="weapon" :class="[d.el.toLowerCase(), d.name]" v-else>
		<img class="main" :src="mainImage" alt="ERROR"/>
		<img class="main shadow" :src="mainImage" alt="ERROR"/>
		<img class="type" :src="typeIcon" alt="ERROR"/>
	</div>
	<p class="times" v-if="d.rank === 5">
		「{{ d.times }}抽」
	</p>
	<img class="rank" :src="rankIcon" alt="ERROR"/>
</div>`;

import { defineComponent, computed } from "vue";

export default defineComponent( {
	name: "WishBox",
	template,
	props: {
		d: Object
	},
	setup( props ) {
		function toString( num ) {
			switch ( num ) {
				case 5:
					return "Five";
				case 4:
					return "Four";
				case 3:
					return "Three";
			}
		}
		
		const boxBackground = computed( () => {
			return `/genshin/adachi-assets/resource/wish/${ toString( props.d.rank ) }Background.webp`;
		} );
		const mainImage = computed( () => {
			if ( props.d.type === "武器" ) {
				return `/genshin/adachi-assets/weapon/${ props.d.name }/image/portrait.webp`
			}
			return `/genshin/adachi-assets/character/${ props.d.name }/image/gacha_card.webp`;
		} );
		const typeIcon = computed( () => {
			const type = props.d.type === "武器" ? "type" : "element";
			return `/genshin/adachi-assets/resource/${ type }/${ props.d.el.toLowerCase() }.webp`;
		} );
		const rankIcon = computed( () => {
			return `/genshin/adachi-assets/resource/wish/${ toString( props.d.rank ) }Star.webp`;
		} );
		
		return {
			boxBackground,
			mainImage,
			typeIcon,
			rankIcon
		}
	}
} )