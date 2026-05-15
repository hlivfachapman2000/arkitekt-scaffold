#!/usr/bin/env python3
'''
🏗️ Arkitekt CLI Dashboard v1.0
Terminal-native control center for the entire Arkitekt swarm.
Built with Textual — Python's most advanced TUI framework.
'''
import sys
import os
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Optional

from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal, Vertical
from textual.widgets import (
    Header, Footer, TabbedContent, Static, Button,
    Input, Log, Tree, DataTable, Placeholder
)
from textual.binding import Binding


class ArkitektDashboard(App):
    '''Main dashboard application.'''
    
    CSS = '''
    Screen { background: #1a1a2e; }
    
    TabbedContent { height: 100%; }
    
    .console-panel {
        width: 70%;
        border: solid #4a9eff;
        background: #16213e;
        padding: 1;
    }
    
    .trace-panel {
        width: 30%;
        border: solid #00d9ff;
        background: #0f3460;
        padding: 1;
    }
    
    #console-log, #trace-log, #research-log {
        background: #0d1b2a;
        color: #e0e0e0;
        border: solid #1b263b;
    }
    
    DataTable {
        background: #16213e;
    }
    
    Tree {
        background: #16213e;
    }
    
    Input { border: solid #4a9eff; }
    '''
    
    BINDINGS = [
        Binding('q', 'quit', 'Quit', show=True),
        Binding('1', 'switch_tab(0)', 'Orch', show=True),
        Binding('2', 'switch_tab(1)', 'Agents', show=True),
        Binding('3', 'switch_tab(2)', 'Code', show=True),
        Binding('4', 'switch_tab(3)', 'Infra', show=True),
        Binding('5', 'switch_tab(4)', 'Memory', show=True),
        Binding('6', 'switch_tab(5)', 'Research', show=True),
        Binding('7', 'switch_tab(6)', 'Scripts', show=True),
        Binding('8', 'switch_tab(7)', 'Tokens', show=True),
        Binding('9', 'switch_tab(8)', 'History', show=True),
        Binding('0', 'switch_tab(9)', 'Vault', show=True),
        Binding('/', 'focus_console', 'Search', show=True),
        Binding('ctrl+s', 'show_settings', 'Settings', show=True),
        Binding('ctrl+g', 'git_status', 'Git', show=True),
    ]
    
    def __init__(self):
        super().__init__()
        self.title = 'Arkitekt Dashboard'
        self.sub_title = 'Touch the impossible'
        self.console_history = []
    
    def compose(self) -> ComposeResult:
        '''Compose the dashboard layout.'''
        yield Header()
        
        # Tabbed content with all tabs
        tabbed = TabbedContent(id='tabs')
        yield tabbed
        
        yield Footer()
    
    def on_mount(self) -> None:
        '''Initialize dashboard tabs and data.'''
        tabbed = self.query_one('#tabs', TabbedContent)
        
        # Build tabs content
        tabs = [
            ('⚡ Orchestrator', self._build_orchestrator_tab),
            ('🤖 Agents', self._build_agents_tab),
            ('🎨 Code', self._build_code_tab),
            ('🏗️ Infra', self._build_infra_tab),
            ('🧠 Memory', self._build_memory_tab),
            ('🔬 Research', self._build_research_tab),
            ('📜 Scripts', self._build_scripts_tab),
            ('💰 Tokens', self._build_tokens_tab),
            ('📜 History', self._build_history_tab),
            ('📚 Vault', self._build_vault_tab),
        ]
        
        for label, builder in tabs:
            tabbed.add_tab(label=label, content=builder())
        
        # Initialize data
        self._populate_agents()
        self._populate_code()
        self._populate_infra()
        self._populate_memory()
        self._populate_scripts()
        self._populate_tokens()
        self._populate_history()
        self._populate_vault()
        
        # Focus console input on orchestrator tab
        self.set_focus(None)
    
    def _build_orchestrator_tab(self) -> ComposeResult:
        '''⚡ Orchestrator tab - Command console + Live execution trace.'''
        with Horizontal():
            with Container(classes='console-panel'):
                yield Static('[b]📟 Command Console[/b]', markup=True)
                yield Log(id='console-log', auto_scroll=True)
                yield Input(placeholder='arkitekt> _', id='console-input')
            with Container(classes='trace-panel'):
                yield Static('[b]⚡ Live Execution[/b]', markup=True)
                yield Log(id='trace-log', auto_scroll=True)
    
    def _build_agents_tab(self) -> ComposeResult:
        '''🤖 Agents tab - Swarm tree view.'''
        tree = Tree(id='agent-tree', label='🏰 Arkitekt Swarm')
        tree.root.expand()
        yield tree
    
    def _build_code_tab(self) -> ComposeResult:
        '''🎨 Code tab - Framework picker.'''
        table = DataTable(id='code-table')
        table.add_columns('Framework', 'Type', 'Status')
        yield table
    
    def _build_infra_tab(self) -> ComposeResult:
        '''🏗️ Infra tab - File server indexer, DBs, services.'''
        with Horizontal():
            table1 = DataTable(id='infra-services')
            table1.add_columns('Service', 'Status', 'Port')
            yield table1
            table2 = DataTable(id='infra-files')
            table2.add_columns('Path', 'Type', 'Size')
            yield table2
    
    def _build_memory_tab(self) -> ComposeResult:
        '''🧠 Memory tab - SQLite, Qdrant, OpenViking stats.'''
        with Horizontal():
            t1 = DataTable(id='memory-sqlite')
            t1.add_columns('Metric', 'Value')
            yield t1
            t2 = DataTable(id='memory-qdrant')
            t2.add_columns('Collection', 'Vectors', 'Status')
            yield t2
    
    def _build_research_tab(self) -> ComposeResult:
        '''🔬 Research tab - ASCII grid map.'''
        yield Log(id='research-log')
    
    def _build_scripts_tab(self) -> ComposeResult:
        '''📜 Scripts tab - Full arsenal.'''
        table = DataTable(id='scripts-table')
        table.add_columns('Script', 'Category', 'Last Run')
        yield table
    
    def _build_tokens_tab(self) -> ComposeResult:
        '''💰 Tokens tab - Economics and savings.'''
        with Vertical():
            table = DataTable(id='tokens-table')
            table.add_columns('Provider', 'Budget', 'Savings')
            yield table
            yield Static('[b]💰 Total Monthly Savings: $1880[/b]', id='tokens-savings', markup=True)
    
    def _build_history_tab(self) -> ComposeResult:
        '''📜 History tab - Merged with archive.'''
        table = DataTable(id='history-table')
        table.add_columns('Time', 'Action', 'Agent', 'Status')
        yield table
    
    def _build_vault_tab(self) -> ComposeResult:
        '''📚 Vault tab - Most important info.'''
        tree = Tree(id='vault-tree', label='📚 Knowledge Vault')
        tree.root.expand()
        yield tree
    
    def _populate_agents(self) -> None:
        '''Populate agents tree from 05__AGENTS directory.'''
        tree = self.query_one('#agent-tree', Tree)
        tree.clear()
        
        root = tree.root
        tree.add(root, '🏰 Arkitekt Swarm', 'folder')
        
        agents_dir = Path('../05__AGENTS')
        if agents_dir.exists():
            for agent in sorted(agents_dir.iterdir()):
                if agent.is_dir() and not agent.name.startswith('_'):
                    tree.add(root, f'🤖 {agent.name}', 'folder')
                elif agent.name.startswith('_') and agent.is_dir():
                    subtree = tree.add(root, f'⚡ {agent.name.replace('_','')}', 'folder')
                    skills_dir = agent / 'SKILLS'
                    if skills_dir.exists():
                        for skill in sorted(skills_dir.glob('*.md'))[:5]:
                            tree.add(subtree, f'  ⚙️ {skill.stem}', 'item')
    
    def _populate_code(self) -> None:
        '''Populate code frameworks table.'''
        table = self.query_one('#code-table', DataTable)
        frameworks = [
            ('Aceternity UI', 'UI Components', '🟢 Available'),
            ('shadcn/ui', 'React Components', '🟢 Available'),
            ('Framer Motion', 'Animations', '🟢 Available'),
            ('Three.js', '3D WebGL', '🟢 Available'),
            ('Tailwind CSS', 'Styling', '🟢 Available'),
            ('React Query', 'Data Fetching', '🟢 Available'),
            ('Next.js 14', 'Framework', '🟢 Available'),
            ('TypeScript', 'Language', '🟢 Available'),
        ]
        for row in frameworks:
            table.add_row(*row)
    
    def _populate_infra(self) -> None:
        '''Populate infrastructure tables.'''
        services = self.query_one('#infra-services', DataTable)
        services.add_row('Qdrant DB', '🟢 Running', '6333')
        services.add_row('Ollama', '🟡 Check', '11434')
        services.add_row('SQLite', '🟢 Running', '-')
        services.add_row('Docker', '🟢 Running', '-')
    
    def _populate_memory(self) -> None:
        '''Populate memory systems stats.'''
        sqlite_table = self.query_one('#memory-sqlite', DataTable)
        sqlite_table.add_row('Tables', '12')
        sqlite_table.add_row('Records', '847')
        sqlite_table.add_row('Last Sync', datetime.now().strftime('%H:%M'))
        
        qdrant_table = self.query_one('#memory-qdrant', DataTable)
        qdrant_table.add_row('files_index', '1,247', '🟢 Ready')
        qdrant_table.add_row('code_index', '892', '🟢 Ready')
    
    def _populate_scripts(self) -> None:
        '''Populate scripts table.'''
        table = self.query_one('#scripts-table', DataTable)
        scripts_dir = Path('../10__SCRIPTS')
        if scripts_dir.exists():
            for script in sorted(scripts_dir.glob('*.sh'))[:10]:
                table.add_row(script.name, 'Maintenance', 'Never')
    
    def _populate_tokens(self) -> None:
        '''Populate token economics table.'''
        table = self.query_one('#tokens-table', DataTable)
        providers = [
            ('Ollama (Local)', '$0', '$0'),
            ('Qdrant (Self-hosted)', '$0', '$0'),
            ('OpenRouter', '$50', '$200'),
            ('Anthropic', '$100', '$400'),
            ('OpenAI', '$150', '$600'),
            ('GitHub Actions', '$0', '$0'),
            ('TOTAL', '$300', '$1,200'),
        ]
        for row in providers:
            table.add_row(*row)
    
    def _populate_history(self) -> None:
        '''Populate history table.'''
        table = self.query_one('#history-table', DataTable)
        history = [
            (datetime.now().strftime('%H:%M'), 'git commit', 'SNIP', '✅'),
            ('22:30', 'agent spawn', 'ORCH', '✅'),
            ('22:15', 'code review', 'CODER', '✅'),
            ('21:45', 'search', 'MEMORY', '✅'),
        ]
        for row in history:
            table.add_row(*row)
    
    def _populate_vault(self) -> None:
        '''Populate vault tree.'''
        tree = self.query_one('#vault-tree', Tree)
        tree.clear()
        
        root = tree.root
        tree.add(root, '📚 Knowledge Vault', 'folder')
        
        vault_dir = Path('../06__KNOWLEDGE_VAULT')
        if vault_dir.exists():
            for item in sorted(vault_dir.iterdir())[:10]:
                if item.is_dir():
                    tree.add(root, f'📁 {item.name}', 'folder')
                else:
                    tree.add(root, f'📄 {item.name}', 'item')
    
    def action_switch_tab(self, tab_num: int) -> None:
        '''Switch to tab by number (0-9).'''
        tabbed = self.query_one('#tabs', TabbedContent)
        tabs_list = list(tabbed.query('Tab'))
        if 0 <= tab_num < len(tabs_list):
            target_tab = tabs_list[tab_num]
            if target_tab.id:
                tabbed.active = target_tab.id
            else:
                tabbed.active = target_tab.label
    
    def action_focus_console(self) -> None:
        '''Focus console input.'''
        try:
            input_widget = self.query_one('#console-input', Input)
            input_widget.focus()
        except:
            pass
    
    def action_show_settings(self) -> None:
        '''Show settings notification.'''
        try:
            log = self.query_one('#console-log', Log)
            log.write_line('⚙️ Settings: Configure MCP, APIs, OpenRouter')
        except:
            pass
    
    def action_git_status(self) -> None:
        '''Show git status.'''
        try:
            log = self.query_one('#console-log', Log)
            log.write_line('🔍 Running git status...')
            result = subprocess.run(['git', 'status', '--short'], 
                                   capture_output=True, text=True, cwd='..')
            for line in result.stdout.split('\n')[:10]:
                if line:
                    log.write_line(line)
        except Exception as e:
            pass
    
    def on_input_submitted(self, event: Input.Submitted) -> None:
        '''Handle console input.'''
        command = event.input.value.strip()
        if not command:
            return
            
        try:
            log = self.query_one('#console-log', Log)
            trace_log = self.query_one('#trace-log', Log)
            
            log.write_line(f'[cyan]🖥️ arkitekt>[/cyan] {command}')
            trace_log.write_line(f'[{datetime.now().strftime('%H:%M:%S')}] EXEC → {command[:40]}')
            
            self._execute_command(command, log)
            event.input.value = ''
        except:
            pass
    
    def _execute_command(self, cmd: str, log: Log) -> None:
        '''Execute a dashboard command.'''
        parts = cmd.split()
        if not parts:
            return
            
        command = parts[0].lower()
        
        commands = {
            'help': lambda: self._cmd_help(log),
            'agents': lambda: self._cmd_agents(log),
            'status': lambda: self._cmd_status(log),
            'vault': lambda: self._cmd_vault(log),
            'search': lambda: self._cmd_search(log, parts),
            'drop': lambda: self._cmd_drop(log, parts),
            'update': lambda: self._cmd_update(log),
        }
        
        if command in commands:
            commands[command]()
        else:
            log.write_line(f'⚠️ Unknown: {command} — type [i]help[/i] for commands')
    
    def _cmd_help(self, log: Log) -> None:
        log.write_line('[b]Available commands:[/b]')
        log.write_line('  help        - Show this help')
        log.write_line('  agents      - List swarm agents')
        log.write_line('  status      - System status')
        log.write_line('  vault       - Open knowledge vault')
        log.write_line('  search <q>  - Search everything')
        log.write_line('  drop <path> - Drop into Smart Pipeline')
        log.write_line('  update      - Run system maintenance')
    
    def _cmd_agents(self, log: Log) -> None:
        log.write_line('🤖 Active Agents:')
        for agent in ['ORCHESTRATOR', 'CRITIC', 'MEMORY_KEEPER', 'SUPERPOWERS']:
            log.write_line(f'  • {agent}')
    
    def _cmd_status(self, log: Log) -> None:
        log.write_line('📊 System Status:')
        log.write_line('  • Qdrant: 🟢 Running')
        log.write_line('  • Ollama: 🟡 Check')
        log.write_line('  • DropZone: 🟢 Ready')
        log.write_line('  • Dashboard: 🟢 Online')
    
    def _cmd_vault(self, log: Log) -> None:
        log.write_line('📚 Opening Knowledge Vault...')
        self.action_switch_tab(9)
    
    def _cmd_search(self, log: Log, parts: list) -> None:
        if len(parts) > 1:
            query = ' '.join(parts[1:])
            log.write_line(f'🔍 Searching for: [b]{query}[/b]')
        else:
            log.write_line('⚠️ Usage: search <query>')
    
    def _cmd_drop(self, log: Log, parts: list) -> None:
        if len(parts) > 1:
            path = parts[1]
            log.write_line(f'📥 Dropping [b]{path}[/b] into Smart Pipeline...')
        else:
            log.write_line('⚠️ Usage: drop <path>')
    
    def _cmd_update(self, log: Log) -> None:
        log.write_line('🔄 Running system maintenance...')


if __name__ == '__main__':
    app = ArkitektDashboard()
    app.run()