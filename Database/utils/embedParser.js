function parseMessageEmbed(message) {
    const contentMatch = message.content.toLowerCase();
  
    let matchedInEmbed = false;
    let embedContent = [];
    const embeds = message.embeds;
  
    if (!embeds || embeds.length === 0) return contentMatch ? {
      author: message.author?.username || 'Unknown',
      content: message.content,
      timestamp: message.createdAt,
      embeds: [],
      footer: []
    } : null;
  
    for (const embed of embeds) {
      const partsToSearch = [];
  
      if (embed.title) partsToSearch.push(embed.title);
      if (embed.description) partsToSearch.push(embed.description);
      if (embed.fields?.length) {
        embed.fields.forEach(f => {
          partsToSearch.push(f.name, f.value);
        });
      }
      if (embed.footer?.text) partsToSearch.push(embed.footer.text);
  
      embedContent = embedContent.concat(partsToSearch);
      if (partsToSearch.some(text => text.toLowerCase())) {
        matchedInEmbed = true;
      }
    }
  
    if (!matchedInEmbed && !contentMatch) return null;
  
    // Format embed content into structured data
    const title = embedContent[0] || '';
    const question = embedContent.find(e => e.includes('**Question:**'))?.replace('**Question:**', '').trim() || '';
    const answerLines = embedContent
    .flatMap(e => e.split('\n'))
    .filter(line => line.includes('✅') || line.includes('❌'));

    const footerText = embeds[0]?.footer?.text || '';
    const [_, questionId, questionType] = footerText.split('•').map(x => x.trim());
  
    const answers = answerLines.map(answer => {
      const emojiMatch = answer.match(/(✅|❌)/);
      if (!emojiMatch) return null;
    
      const parts = answer.trim().split(' ');
      const answerId = parts[parts.length - 1].replace(/`/g, '');
      const answerText = parts.slice(1, parts.length - 1).join(' ').replace(/`/g, '').trim();
    
      return {
        Answer_Text: answerText,
        Answer_ID: answerId,
        Question_ID: questionId,
        Question_Type: questionType,
        Correct: emojiMatch[0] === '✅'
      };
    }).filter(Boolean);
    
  
    return {
      Title: title,
      Question: question,
      Answer: answers
    };
  }
  
  module.exports = parseMessageEmbed;
  