import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';

    let html = value;

    // Escape HTML entities first
    html = this.escapeHtml(html);

    // Code blocks with triple backticks (must be before single backticks)
    html = html.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code - non-greedy match
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    // Headers (must be processed before bold to avoid conflicts)
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold - non-greedy match (process before italic)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic - single asterisk (not adjacent to other asterisks)
    // This will work after bold is already processed
    html = html.replace(/\b\*([^\*\n]+?)\*\b/g, '<em>$1</em>');
    
    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Lists - process before line breaks
    html = this.processLists(html);
    
    // Line breaks - preserve newlines (but not inside pre/code blocks)
    html = html.replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    
    // Don't escape backticks or asterisks (markdown symbols)
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  private processLists(html: string): string {
    // Split by lines
    const lines = html.split('\n');
    const result: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line is a list item
      if (/^[\s]*[-*]\s+(.+)$/.test(line)) {
        if (!inList) {
          result.push('<ul>');
          inList = true;
        }
        // Extract list item content
        const content = line.replace(/^[\s]*[-*]\s+/, '');
        result.push(`<li>${content}</li>`);
      } else {
        // Not a list item
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        result.push(line);
      }
    }

    // Close any open list
    if (inList) {
      result.push('</ul>');
    }

    return result.join('\n');
  }
}
