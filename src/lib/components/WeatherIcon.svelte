<script lang="ts">
	import { getMeteoconFilename } from '$lib/weatherUtils';

	let { symbolCode = '', size = 'md' } = $props<{
		symbolCode: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
	}>();

	// Map sizes to Tailwind dimension classes
	let sizeClasses = $derived({
		sm: 'w-6 h-6',
		md: 'w-10 h-10',
		lg: 'w-16 h-16',
		xl: 'w-24 h-24'
	}[size]);

	let filename = $derived(getMeteoconFilename(symbolCode));
</script>

<div class="weather-icon flex items-center justify-center {sizeClasses} select-none">
	<img 
		src="/weather-icons/{filename}" 
		alt={symbolCode} 
		class="w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] filter"
		loading="lazy"
	/>
</div>
