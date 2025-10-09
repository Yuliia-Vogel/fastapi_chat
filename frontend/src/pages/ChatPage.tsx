
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { UserList } from '../components/UserList';
import { ChatWindow } from '../components/ChatWindow';

export function ChatPage() {
    const { logout, user } = useAuth();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    return (
        // --- ЗАГАЛЬНИЙ КОНТЕЙНЕР ---
        // h-screen: висота 100% від висоти екрану.
        // bg-gray-100: світло-сірий фон для всього додатку.
        // font-sans: встановлює стандартний шрифт без засічок.
        // overflow-hidden: ховає все, що виходить за межі екрану, щоб уникнути небажаної прокрутки.
        <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
            
            {/* --- ЛІВА КОЛОНКА (САЙДБАР) --- */}
            {/* // w-full md:w-1/3: на мобільних пристроях (до md) сайдбар займає всю ширину.  */}
            {/* //                   На екранах більше `md` (768px) - займає 1/3 ширини. */}
            {/* //                   `selectedUser ? 'hidden' : 'flex'` - трюк для мобільних: якщо чат обрано, ховаємо сайдбар. */}
            {/* // bg-white: білий фон. */}
            {/* // border-r: тонка сіра рамка справа. */}
            {/* // flex flex-col: робить цей блок flex-контейнером з вертикальним напрямком. */}
            {/* // Міняю md на sm (640px), бо на моєму ноутбуці, схоже, менша розд.здатність, ніж 768px */}
            <aside className={`${selectedUser ? 'hidden' : 'flex'} sm:flex w-full flex-col sm:w-1/3 bg-white border-r border-gray-200`}>
                
                {/* --- ЗАГОЛОВОК САЙДБАРУ --- */}
                {/* // p-4: відступ з усіх боків. */}
                {/* // border-b: тонка сіра рамка знизу. */}
                {/* // justify-between: розкидає елементи по краях (назва зліва, кнопка справа). */}
                {/* // items-center: вирівнює елементи по вертикальному центру. */}
                {/* // flex-shrink-0: забороняє цьому блоку стискатися, якщо контенту забагато. */}
                <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Чати ({user?.username})</h2>
                    <button
                        onClick={logout}
                        // transition-colors: додає плавний ефект при зміні кольору.
                        // duration-200: тривалість анімації 200 мілісекунд.
                        className="px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors duration-200"
                    >
                        Вийти
                    </button>
                </header>

                {/* --- КОНТЕЙНЕР ДЛЯ СПИСКУ КОРИСТУВАЧІВ --- */}
                {/* // flex-grow: цей блок "росте", займаючи весь доступний вільний простір. */}
                {/* // overflow-y-auto: якщо список користувачів не влазить по висоті, з'явиться вертикальна прокрутка. */}
                <div className="flex-grow overflow-y-auto">
                   <UserList onSelectUser={setSelectedUser} selectedUserId={selectedUser?.id || null} />
                </div>
            </aside>

            {/* --- ПРАВА КОЛОНКА (ГОЛОВНИЙ КОНТЕНТ) --- */}
            {/* // `selectedUser ? 'flex' : 'hidden'` - трюк для мобільних: показуємо чат, тільки якщо він обраний. */}
            <main className={`${selectedUser ? 'flex' : 'hidden'} sm:flex w-full flex-col sm:w-2/3`}>
                {selectedUser ? (
                    // Передаємо функцію, щоб можна було закрити чат на мобільному
                    <ChatWindow selectedUser={selectedUser} onBack={() => setSelectedUser(null)} />
                ) : (
                    // ЗАГЛУШКА, ЯКЩО ЧАТ НЕ ОБРАНО (для великих екранів)
                    // items-center justify-center: класичний спосіб відцентрувати щось по горизонталі і вертикалі.
                    <div className="hidden md:flex items-center justify-center h-full">
                        <p className="text-gray-500 text-lg">Оберіть чат, щоб почати спілкування</p>
                    </div>
                )}
            </main>
        </div>
    );
}