
if (targetMatch) {
    h2hMatches.push({
        ...targetMatch,
        tournament: { name: t.tournament }
    });
}
            }
        }

return h2hMatches;

    } catch (error) {
    console.error('Error finding H2H matches:', error);
    return [];
}
}
