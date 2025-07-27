import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function CalendarScreen({ navigation }) {
  const { apiCall } = useAuth();
  const { colors, getText } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [dayNotes, setDayNotes] = useState([]);

  // Kutu renkleri
  const boxColors = {
    'daily': '#3b82f6',        // Mavi (takvimde gösterilmez)
    'every_2_days': '#ef4444', // Kırmızı
    'every_4_days': '#f97316', // Turuncu
    'weekly': '#8b5cf6',       // Mor
    'every_2_weeks': '#10b981', // Yeşil
    'learned': '#6b7280'       // Gri
  };

  const boxNames = {
    'daily': getText('daily'),
    'every_2_days': getText('every2Days'),
    'every_4_days': getText('every4Days'),
    'weekly': getText('weekly'),
    'every_2_weeks': getText('every2Weeks'),
    'learned': getText('learned')
  };

  const monthNames = [
    getText('january'), getText('february'), getText('march'), getText('april'),
    getText('may'), getText('june'), getText('july'), getText('august'),
    getText('september'), getText('october'), getText('november'), getText('december')
  ];

  const dayNames = [
    getText('monday'), getText('tuesday'), getText('wednesday'), getText('thursday'),
    getText('friday'), getText('saturday'), getText('sunday')
  ];

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await apiCall(`/api/notes/calendar/${year}/${month}`, {
        method: 'GET'
      });

      if (response.success) {
        setCalendarData(response);
      } else {
        console.error('Takvim verileri yüklenemedi:', response.message);
      }
    } catch (error) {
      console.error('Takvim yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDayData = (day, isCurrentMonth, isPrevMonth) => {
    if (!calendarData) return { dots: [], isCompleted: false, isToday: false };

    // Doğru tarihi hesapla
    let year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1;
    
    if (!isCurrentMonth) {
      if (isPrevMonth) {
        // Önceki ay
        if (month === 1) {
          year--;
          month = 12;
        } else {
          month--;
        }
      } else {
        // Sonraki ay
        if (month === 12) {
          year++;
          month = 1;
        } else {
          month++;
        }
      }
    }

    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    
    // O gün için notları filtrele
    const dayNotes = calendarData.notes.filter(note => note.review_date === dateStr);
    
    // Renk noktalarını oluştur (daily hariç)
    const dots = [];
    const addedColors = new Set();
    
    dayNotes.forEach(note => {
      if (note.box_type !== 'daily' && !addedColors.has(note.box_type)) {
        dots.push({
          color: boxColors[note.box_type],
          boxType: note.box_type
        });
        addedColors.add(note.box_type);
      }
    });

    return {
      dots,
      isCompleted: calendarData.completedDays.includes(dateStr),
      isToday: dateStr === today,
      notes: dayNotes
    };
  };

  const handleDayPress = (day, isCurrentMonth, isPrevMonth) => {
    const dayData = getDayData(day, isCurrentMonth, isPrevMonth);
    if (dayData.notes.length > 0 || dayData.isCompleted) {
      setSelectedDay(day);
      setDayNotes(dayData.notes);
      setShowDayModal(true);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: 90,
      paddingBottom: 16,
      paddingHorizontal: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '300',
      textAlign: 'center',
      letterSpacing: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
    },
    content: {
      flex: 1,
      paddingHorizontal: 12,
      paddingTop: 8,
    },
    monthNav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 12,
    },
    monthTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    dayHeaders: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    dayHeader: {
      flex: 1,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '600',
      paddingVertical: 8,
    },
    monthYearContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    monthYear: {
      fontSize: 22,
      fontWeight: '600',
    },
    navButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    navButtonText: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    calendar: {
      paddingHorizontal: 24,
    },
    weekHeader: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    weekHeaderDay: {
      flex: 1,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '500',
      paddingVertical: 8,
    },
    week: {
      flexDirection: 'row',
    },
    day: {
      flex: 1,
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      margin: 1,
      borderRadius: 8,
      position: 'relative',
      minHeight: 40,
      borderWidth: 1,
      borderColor: colors.border,
    },
    currentMonthDay: {
      backgroundColor: colors.surface,
    },
    otherMonthDay: {
      backgroundColor: 'transparent',
      opacity: 0.4,
    },
    today: {
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    completedDay: {
      backgroundColor: colors.success,
    },
    dayText: {
      fontSize: 14,
      fontWeight: '500',
    },
    todayText: {
      color: '#ffffff',
      fontWeight: 'bold',
    },
    completedDayText: {
      color: '#ffffff',
      fontWeight: 'bold',
    },
    otherMonthText: {
      fontSize: 12,
      opacity: 0.5,
    },
    dotsContainer: {
      position: 'absolute',
      bottom: 4,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    moreDots: {
      fontSize: 8,
      color: colors.textSecondary,
      marginLeft: 2,
    },
    legend: {
      paddingHorizontal: 24,
      paddingVertical: 24,
    },
    legendTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    legendItems: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    legendDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: 8,
    },
    legendText: {
      fontSize: 14,
    },
    spacer: {
      height: 50,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      width: '100%',
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    modalBody: {
      padding: 24,
    },
    modalSubtitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    noteItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginBottom: 8,
    },
    noteColor: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: 12,
    },
    noteInfo: {
      flex: 1,
    },
    noteTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    noteBox: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    noNotesText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Haftanın hangi günü başlıyor (Pazartesi = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days = [];
    
    // Önceki ayın günleri
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }
    
    // Bu ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day: day,
        isCurrentMonth: true,
        isPrevMonth: false
      });
    }

    // Sonraki ayın günleri (42 gün = 6 hafta için)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day: day,
        isCurrentMonth: false,
        isPrevMonth: false
      });
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks.map((week, weekIndex) => (
      <View key={weekIndex} style={styles.week}>
        {week.map((dayObj, dayIndex) => {
          const dayData = getDayData(dayObj.day, dayObj.isCurrentMonth, dayObj.isPrevMonth);
          
          return (
            <TouchableOpacity
              key={dayIndex}
              style={[
                styles.day,
                dayObj.isCurrentMonth ? styles.currentMonthDay : styles.otherMonthDay,
                dayData.isToday && dayObj.isCurrentMonth && styles.today,
                dayData.isCompleted && dayObj.isCurrentMonth && styles.completedDay,
                // Web için ek stil
                typeof window !== 'undefined' && dayData.isToday && dayObj.isCurrentMonth && {
                  boxShadow: '0 0 0 3px #2563eb',
                  borderColor: '#2563eb'
                }
              ]}
              onPress={() => handleDayPress(dayObj.day, dayObj.isCurrentMonth, dayObj.isPrevMonth)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dayText,
                { color: colors.text },
                !dayObj.isCurrentMonth && [styles.otherMonthText, { color: colors.textSecondary }],
                dayData.isToday && dayObj.isCurrentMonth && styles.todayText,
                dayData.isCompleted && dayObj.isCurrentMonth && styles.completedDayText
              ]}>
                {dayObj.day}
              </Text>
              
              {/* Renk noktaları - tüm günler için */}
              {dayData.dots.length > 0 && (
                <View style={styles.dotsContainer}>
                  {dayData.dots.slice(0, 4).map((dot, index) => (
                                          typeof window !== 'undefined' ? (
                        <div
                          key={index}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: dot.color,
                            margin: '0 1px',
                            border: '1px solid white',
                            display: 'inline-block'
                          }}
                        />
                      ) : (
                        <View
                          key={index}
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: dot.color,
                            marginHorizontal: 1,
                            borderWidth: 1,
                            borderColor: '#ffffff',
                          }}
                        />
                      )
                  ))}
                  {dayData.dots.length > 4 && (
                    <Text style={styles.moreDots}>+</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {getText('calendar')}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {getText('language') === 'en' ? 'Loading calendar...' : 'Takvim yükleniyor...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {getText('calendar')}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={[styles.navButton, { backgroundColor: colors.card }]}>
            <Text style={[styles.navButtonText, { color: colors.text }]}>‹</Text>
          </TouchableOpacity>
          
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          
          <TouchableOpacity onPress={() => navigateMonth(1)} style={[styles.navButton, { backgroundColor: colors.card }]}>
            <Text style={[styles.navButtonText, { color: colors.text }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day Headers */}
        <View style={styles.dayHeaders}>
          {dayNames.map((dayName, index) => (
            <Text key={index} style={[styles.dayHeader, { color: colors.text }]}>
              {dayName}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendar}>
          {renderCalendar()}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>
            {getText('colorLegend')}
          </Text>
          <View style={styles.legendItems}>
            {Object.entries(boxColors).map(([boxType, color]) => {
              if (boxType === 'daily') return null; // Daily gösterilmez
              return (
                <View key={boxType} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={[styles.legendText, { color: colors.text }]}>{boxNames[boxType]}</Text>
                </View>
              );
            })}
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={[styles.legendText, { color: colors.text }]}>
                {getText('completedDay')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Day Detail Modal */}
      <Modal
        visible={showDayModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedDay} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>
              <TouchableOpacity onPress={() => setShowDayModal(false)} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {dayNotes.length > 0 ? (
                <>
                  <Text style={[styles.modalSubtitle, { color: colors.text }]}>
                    {getText('language') === 'en' ? 'Notes to review today:' : 'Bu gün tekrar edilecek notlar:'}
                  </Text>
                  {dayNotes.map((note, index) => (
                    <View key={index} style={styles.noteItem}>
                      <View style={[styles.noteColor, { backgroundColor: boxColors[note.box_type] }]} />
                      <View style={styles.noteInfo}>
                        <Text style={[styles.noteTitle, { color: colors.text }]}>{note.title}</Text>
                        <Text style={[styles.noteBox, { color: colors.textSecondary }]}>{boxNames[note.box_type]}</Text>
                      </View>
                    </View>
                  ))}
                </>
              ) : (
                <Text style={[styles.noNotesText, { color: colors.text }]}>
                  {getText('language') === 'en' ? 'No notes to review today.' : 'Bu gün tekrar edilecek not yok.'}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
} 