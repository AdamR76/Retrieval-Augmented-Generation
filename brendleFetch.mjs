import fs from 'fs/promises';

fetch('https://www.brendlegroup.com/2024-team/')
	.then(res => res.text())
	.then(data => {
		const teamMembers = data.matchAll(
			/<div class="team-name">(.*?)<\/div>[\s\S]*?<div class="team-title">(.*?)<\/div>([\s\S]*?)(?=<div class="team-name">|$)/g
		);
		const bios = [];
		for (const member of teamMembers) {
			const [_, name, title, section] = member;
			const bioMatches = section.matchAll(/<p>(.*?)<\/p>/g);
			const ulMatches = section.matchAll(/<ul>([\s\S]*?)<\/ul>/g);
			const modalMatch = section.match(/<div class="modal-body fusion-clearfix">([\s\S]*?)<\/div>/);

			let bio = Array.from(bioMatches)
				.map(match => match[1].trim())
				.filter(text => text)
				.join(' ');

			// Extract and add list items
			const lists = Array.from(ulMatches)
				.map(match => {
					const items = match[1].matchAll(/<li>(.*?)<\/li>/g);
					return Array.from(items)
						.map(item => item[1].trim())
						.filter(text => text)
						.join(', ');
				})
				.join('. ');

			if (lists) {
				bio += ' ' + lists;
			}

			if (modalMatch) {
				const modalText = modalMatch[1].replace(/<[^>]*>/g, '').trim();
				bio += ' ' + modalText;
			}

			bios.push({
				name: name.trim(),
				title: title.trim(),
				bio: bio.trim(),
			});
		}
		return bios;
	})
	.then(data => {
		const combined = data.map(Object.values).map(row => {
			let bio = '';
			for (const value of row) bio += ' ' + value.replace(/&amp;/g, '&').replace(/<\/{0,1}strong>/g, '');
			return { bio };
		});
		return combined;
	})
	.then(bios =>
		bios.map((bio, idx) => fs.writeFile(`./content/${idx}.txt`, bio.bio, 'utf8').catch(console.error))
	);
