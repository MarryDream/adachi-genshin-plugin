const template = `<div class="home-box">
	<img class="home-background" :src="backgroundImage" alt="ERROR"/>
	<template v-if="data.level !== -1">
		<div class="box-block unlock-block"/>
		<div class="box-block unlock-content-block">
			<p class="box-content name">{{ data.name }}</p>
			<p class="box-content level">洞天等级</p>
			<p class="box-content comfort">{{ data.comfortLevelName }}</p>
		</div>
	</template>
	<template v-else>
		<div class="box-block locked-block"/>
		<img class="lock-icon" :src="lockIcon" alt="ERROR"/>
	</template>
</div>`;


import { defineComponent, computed } from "vue";

export default defineComponent( {
	name: "HomeBox",
	template,
	props: {
		data: Object
	},
	setup( props ) {
		const backgroundImage = computed( () => {
			return `/genshin/adachi-assets/resource/home/${ props.data.name }.png`;
		} );
		const lockIcon = computed( () => {
			return "/genshin/adachi-assets/resource/common/icon/lock.png";
		} );
		
		return {
			backgroundImage,
			lockIcon
		};
	}
} );
